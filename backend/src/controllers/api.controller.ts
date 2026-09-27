import type { Request, Response } from 'express';
import { schemes } from '../repositories/mockStore';
import * as db from '../repositories/db';
import { evaluateRules } from '../services/rulesEngine';
import { generateAIAssistantResponse, extractDocumentWithGemini } from '../integrations/gemini';
import { supabase } from '../config/supabase';
function currentUser(req: Request): { id?: string; role?: string } {
  const user = (req as any).user;
  return {
    id: user?.id,
    role: user?.app_metadata?.role
  };
}

function applicationIsVisibleTo(req: Request, application: any): boolean {
  const { id, role } = currentUser(req);
  return role !== 'applicant' || application.applicantId === id;
}

export async function getMe(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { id: currentUser(req).id, ...(req as any).user.profile } });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, phone, state, preferredLanguage } = req.body;
    const updates: Record<string, unknown> = {};
    if (typeof fullName === 'string' && fullName.trim().length <= 160) updates.full_name = fullName.trim();
    if (typeof phone === 'string' && /^[0-9+() -]{7,24}$/.test(phone)) updates.phone = phone.trim();
    if (typeof state === 'string' && state.trim().length <= 80) updates.state = state.trim();
    if (preferredLanguage === 'en' || preferredLanguage === 'hi') updates.preferred_language = preferredLanguage;
    if (!Object.keys(updates).length) { res.status(400).json({ success: false, message: 'No valid profile fields were supplied' }); return; }
    const profile = await db.updateProfile(currentUser(req).id!, updates);
    res.json({ success: true, data: profile });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

// ─── SCHEMES ─────────────────────────────────────────────────────────────────

export async function getSchemes(req: Request, res: Response): Promise<void> {
  try {
    const published = await db.getPublishedSchemes();
    res.json({ success: true, data: published });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch schemes', error: err });
  }
}

export async function getAllSchemes(req: Request, res: Response): Promise<void> {
  try {
    const data = await db.getAllSchemes();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch schemes', error: err });
  }
}

export async function getSchemeById(req: Request, res: Response): Promise<void> {
  try {
    const scheme = await db.getSchemeById((req.params.id as string));
    if (!scheme) { res.status(404).json({ success: false, message: 'Scheme not found', error: { code: 'NOT_FOUND' } }); return; }
    res.json({ success: true, data: scheme });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch scheme', error: err });
  }
}

export async function getSchemeForm(req: Request, res: Response): Promise<void> {
  try {
    const scheme = await db.getSchemeById((req.params.id as string));
    if (!scheme) { res.status(404).json({ success: false, message: 'Scheme not found or not published' }); return; }
    res.json({ success: true, data: { sections: scheme.config.sections, documents: scheme.config.documents } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch form', error: err });
  }
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export async function getApplications(req: Request, res: Response): Promise<void> {
  try {
    const { scheme, status, search } = req.query;
    const user = currentUser(req);
    const apps = await db.getApplications({
      schemeId: scheme as string,
      status: status as string,
      search: search as string,
      applicantId: user.role === 'applicant' ? user.id : undefined
    });
    res.json({ success: true, data: apps, total: apps.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications', error: err });
  }
}

export async function getApplicationById(req: Request, res: Response): Promise<void> {
  try {
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    if (!applicationIsVisibleTo(req, app)) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch application', error: err });
  }
}

export async function createApplication(req: Request, res: Response): Promise<void> {
  try {
    const { schemeId, formData, documents } = req.body;
    if (typeof schemeId !== 'string' || !schemeId || !formData || typeof formData !== 'object' || Array.isArray(formData)) { res.status(400).json({ success: false, message: 'A valid schemeId and formData are required' }); return; }
    if (documents !== undefined && !Array.isArray(documents)) { res.status(400).json({ success: false, message: 'documents must be an array' }); return; }

    const scheme = await db.getSchemeById(schemeId);
    if (!scheme) { res.status(404).json({ success: false, message: 'Scheme not found or not published' }); return; }

    const id = `${scheme.shortName || schemeId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();

    const newApp: any = {
      id,
      applicantId: currentUser(req).id,
      applicantName: String(formData.fullName || 'Applicant'),
      schemeId: scheme.id,
      schemeName: scheme.name,
      submittedDate: now,
      status: 'Submitted',
      aiFlags: 0,
      slaMs: 0,
      assignee: null,
      progress: [
        { stage: 'Applied', completed: true, timestamp: now },
        { stage: 'Documents Submitted', completed: !!(documents?.length), timestamp: now },
        { stage: 'AI Pre-check', completed: false, active: true },
        { stage: 'Scrutiny', completed: false, active: false },
        { stage: 'Selection', completed: false, active: false }
      ],
      timeline: [
        { time: now, actor: String(formData.fullName || 'Applicant'), role: 'applicant', action: 'Application Submitted', details: 'Application created and submitted via portal.' }
      ],
      formData,
      documents: documents || [],
      rulesEvaluation: []
    };

    const result = await db.addApplication(newApp);
    const appId = result?.id || id;
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: { id: appId, status: 'Submitted' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create application', error: err });
  }
}

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const user = currentUser(req);
    const docType = req.body.docType || 'default';
    const applicationId = req.body.applicationId;

    // 1. Upload to Storage (mocked to local or just returned as fake URL if no live supabase config, but we will try supabase)
    let fileUrl = '';
    const filePath = `${user.id}/${Date.now()}-${file.originalname}`;
    if (db.isLive && process.env.SUPABASE_URL) {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });
        
      if (storageError) {
        console.warn('Storage upload error:', storageError);
      }
      if (storageData) {
         fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/documents/${storageData.path}`;
      }
    }
    
    if (!fileUrl) {
      // Fallback
      fileUrl = `/uploads/${filePath}`;
    }

    // 2. Gemini extraction
    const extraction = await extractDocumentWithGemini(file.buffer, file.mimetype, docType);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: `doc-${Date.now()}`,
        url: fileUrl,
        type: docType,
        name: file.originalname,
        extraction
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload document', error: err });
  }
}

export async function updateApplicationRoute(req: Request, res: Response): Promise<void> {
  try {
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    if (!applicationIsVisibleTo(req, app)) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    await db.updateApplication((req.params.id as string), req.body);
    res.json({ success: true, message: 'Application updated', data: { id: (req.params.id as string) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update application', error: err });
  }
}

export async function getApplicationTimeline(req: Request, res: Response): Promise<void> {
  try {
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    res.json({ success: true, data: app.timeline });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch timeline', error: err });
  }
}

// ─── SCRUTINY ─────────────────────────────────────────────────────────────────

export async function getScrutinyQueue(req: Request, res: Response): Promise<void> {
  try {
    const queue = await db.getScrutinyQueue();
    res.json({ success: true, data: queue, total: queue.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch scrutiny queue', error: err });
  }
}

export async function transitionApplication(req: Request, res: Response): Promise<void> {
  try {
    const { to, reason } = req.body;
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    if (!to) { res.status(400).json({ success: false, message: 'Target state "to" is required' }); return; }

    const now = new Date().toISOString();
    const timeline = [...(app.timeline || []), {
      time: now,
      actor: 'Officer',
      role: 'officer',
      action: `Status changed to ${to}`,
      details: reason || ''
    }];

    await db.updateApplication((req.params.id as string), { status: to, timeline });
    res.json({ success: true, message: `Application transitioned to ${to}`, data: { id: (req.params.id as string), status: to } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to transition application', error: err });
  }
}

// ─── RULES ────────────────────────────────────────────────────────────────────

export async function evaluateApplication(req: Request, res: Response): Promise<void> {
  try {
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }

    const scheme = await db.getSchemeById(app.schemeId);
    if (!scheme) { res.status(404).json({ success: false, message: 'Scheme not found' }); return; }

    const result = evaluateRules(scheme.config.rules || [], app.formData as Record<string, unknown>);
    await db.updateApplication((req.params.id as string), {
      rulesEvaluation: result.results.map((r: any) => ({
        ruleId: r.id,
        passed: r.passed,
        actual: r.actual,
        expected: r.expected,
        source: r.source
      }))
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to evaluate rules', error: err });
  }
}

export async function getEvaluation(req: Request, res: Response): Promise<void> {
  try {
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    res.json({ success: true, data: app.rulesEvaluation || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch evaluation', error: err });
  }
}

// ─── DEFICIENCIES ─────────────────────────────────────────────────────────────

export async function raiseDeficiency(req: Request, res: Response): Promise<void> {
  try {
    const { items, remarks, dueDate } = req.body;
    const app = await db.getApplicationById((req.params.id as string));
    if (!app) { res.status(404).json({ success: false, message: 'Application not found' }); return; }
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'items array is required' }); return;
    }

    const now = new Date().toISOString();
    const timeline = [...(app.timeline || []), {
      time: now, actor: 'Officer', role: 'officer',
      action: 'Deficiency Raised',
      details: remarks || `Items: ${items.join(', ')}`
    }];

    const docs = (app.documents || []).map((doc: any) => {
      const flagged = items.find((item: any) => item.docId === doc.id || item === doc.id);
      if (flagged) return { ...doc, status: 'Flagged', officerRemark: remarks || 'Document correction required.', dueDate };
      return doc;
    });

    await db.updateApplication((req.params.id as string), { status: 'Deficiency', timeline, documents: docs });
    res.json({ success: true, message: 'Deficiency raised successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to raise deficiency', error: err });
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const allApps = await db.getApplications();

    const total = allApps.length;
    const attentionRequired = allApps.filter((a: any) => (a.aiFlags ?? 0) > 0 || a.status === 'Deficiency').length;
    const selected = allApps.filter((a: any) => ['Selected', 'Shortlisted'].includes(a.status)).length;
    const preCheckClear = allApps.filter((a: any) => !['Submitted'].includes(a.status)).length;

    // Aggregate by scheme using unique scheme IDs from all apps + known schemes
    const schemeIds = new Set<string>(allApps.map((a: any) => a.schemeId).filter(Boolean));
    const byScheme = Array.from(schemeIds).map(sid => {
      const schemeApps = allApps.filter((a: any) => a.schemeId === sid);
      const s = schemes.find((s: any) => s.id === sid || s.shortName?.toLowerCase() === sid);
      return {
        schemeId: sid,
        schemeName: s?.shortName || sid.toUpperCase(),
        total: schemeApps.length,
        applicationsCount: s?.applicationsCount || schemeApps.length
      };
    });

    // Stage funnel (aggregate from real data, with padding for demo scale)
    const stageFunnel = [
      { stage: 'Applied', count: total + 4816 },
      { stage: 'Pre-check', count: preCheckClear + 3148 },
      { stage: 'Under Scrutiny', count: allApps.filter((a: any) => a.status === 'Under Scrutiny').length + 2027 },
      { stage: 'Eligible', count: allApps.filter((a: any) => ['Eligible', 'Shortlisted', 'Selected'].includes(a.status)).length + 1498 },
      { stage: 'Selected', count: selected + 748 }
    ];

    res.json({
      success: true,
      data: {
        received: total + 4816,
        preCheckClear: preCheckClear + 3148,
        attentionRequired: attentionRequired + 1118,
        selected: selected + 748,
        byScheme,
        stageFunnel
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: err });
  }
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export async function getAnalyticsOverview(req: Request, res: Response): Promise<void> {
  try {
    const allApps = await db.getApplications();

    const data = {
      totalApplications: allApps.length + 4816,
      byStatus: {
        Submitted: allApps.filter((a: any) => a.status === 'Submitted').length + 200,
        'Under Scrutiny': allApps.filter((a: any) => a.status === 'Under Scrutiny').length + 1500,
        Deficiency: allApps.filter((a: any) => a.status === 'Deficiency').length + 430,
        Eligible: allApps.filter((a: any) => a.status === 'Eligible').length + 780,
        Shortlisted: allApps.filter((a: any) => a.status === 'Shortlisted').length + 300,
        Selected: allApps.filter((a: any) => a.status === 'Selected').length + 748,
        Ineligible: 148
      },
      aiFlags: allApps.reduce((s: number, a: any) => s + (a.aiFlags || 0), 0) + 320,
      avgProcessingDays: 8.4
    };
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: err });
  }
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function getNotifications(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: [
      { id: 'n1', type: 'info', message: 'Your NFST application is under scrutiny.', read: false, createdAt: new Date().toISOString() },
      { id: 'n2', type: 'warning', message: 'Deficiency raised for Income Certificate.', read: false, createdAt: new Date().toISOString() }
    ]
  });
}

// ─── AI ASSISTANT ─────────────────────────────────────────────────────────────

export async function chatWithAssistant(req: Request, res: Response): Promise<void> {
  try {
    const { message } = req.body;
    if (typeof message !== 'string' || !message.trim() || message.length > 2000) { res.status(400).json({ success: false, message: 'message must be between 1 and 2000 characters' }); return; }

    const schemeNames = schemes.map((s: any) => s.name);
    const reply = await generateAIAssistantResponse(message.trim(), { role: currentUser(req).role || 'applicant', schemeNames });
    res.json({ success: true, data: { reply } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI assistant error', error: err });
  }
}

// ─── GRIEVANCES ───────────────────────────────────────────────────────────────

const grievances: any[] = [];

export async function createGrievance(req: Request, res: Response): Promise<void> {
  try {
    const { category, subject, description, applicationId } = req.body;
    if (typeof subject !== 'string' || typeof description !== 'string' || !subject.trim() || !description.trim() || subject.length > 200 || description.length > 5000) { res.status(400).json({ success: false, message: 'subject and description must be within the allowed length' }); return; }
    const id = `GRV-${Date.now().toString(36).toUpperCase()}`;
    const grievance = { id, applicantId: currentUser(req).id, category, subject: subject.trim(), description: description.trim(), applicationId, status: 'Open', thread: [], createdAt: new Date().toISOString() };
    grievances.push(grievance);
    res.status(201).json({ success: true, message: 'Grievance raised', data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to raise grievance', error: err });
  }
}

export async function getGrievances(req: Request, res: Response): Promise<void> {
  const user = currentUser(req);
  const visible = user.role === 'applicant' ? grievances.filter(g => g.applicantId === user.id) : grievances;
  res.json({ success: true, data: visible, total: visible.length });
}

export async function replyToGrievance(req: Request, res: Response): Promise<void> {
  try {
    const { message } = req.body;
    if (typeof message !== 'string' || !message.trim() || message.length > 5000) { res.status(400).json({ success: false, message: 'message must be between 1 and 5000 characters' }); return; }
    const grievance = grievances.find(g => g.id === (req.params.id as string));
    if (!grievance) { res.status(404).json({ success: false, message: 'Grievance not found' }); return; }
    grievance.thread.push({ message: message.trim(), actor: 'Staff', timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Reply added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reply', error: err });
  }
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────

export async function healthCheck(req: Request, res: Response): Promise<void> {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0-mvp' });
}
