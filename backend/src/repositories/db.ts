import { supabase } from '../config/supabase';
import {
  schemes as mockSchemes,
  mockApplications,
  addApplication as mockAddApp,
  updateApplication as mockUpdateApp
} from './mockStore';

function hasLiveSupabaseConfiguration(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key || /^(YOUR_|dummy)/i.test(url) || /^(YOUR_|dummy)/i.test(key)) return false;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && !['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export const isLive = hasLiveSupabaseConfiguration();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalize a raw Supabase application row into the shape the frontend expects.
 * Falls back gracefully when optional nested data is missing.
 */
function normalizeApp(row: any): any {
  // If it's already in the mock/full shape, return as-is
  if (row.applicantName !== undefined) return row;

  const formData = row.form_data || {};
  const schemeFull = row.schemes || {};
  const schemeCode = row.scheme_code || schemeFull.code || 'UNKNOWN';
  const schemeName = schemeFull.name || row.scheme_name || schemeCode;
  const now = row.submitted_at || new Date().toISOString();

  return {
    id: row.id,
    applicantId: row.applicant_id,
    applicantName: formData.fullName || formData.full_name || 'Applicant',
    schemeId: schemeCode.toLowerCase(),
    schemeName,
    submittedDate: now,
    status: capitalizeState(row.current_state || 'submitted'),
    aiFlags: row.ai_flags || 0,
    slaMs: row.sla_ms || 0,
    assignee: row.assigned_officer_id || null,
    progress: row.progress || [
      { stage: 'Applied', completed: true, timestamp: now },
      { stage: 'Documents Submitted', completed: true, timestamp: now },
      { stage: 'AI Pre-check', completed: false, active: true },
      { stage: 'Scrutiny', completed: false, active: false },
      { stage: 'Selection', completed: false, active: false }
    ],
    timeline: row.timeline || [
      { time: now, actor: formData.fullName || 'Applicant', role: 'applicant', action: 'Application Submitted', details: 'Application created via portal.' }
    ],
    formData,
    documents: row.documents || [],
    rulesEvaluation: row.rulesEvaluation || row.rules_evaluation || []
  };
}

function capitalizeState(state: string): string {
  const map: Record<string, string> = {
    submitted: 'Submitted',
    under_scrutiny: 'Under Scrutiny',
    deficiency: 'Deficiency',
    eligible: 'Eligible',
    ineligible: 'Ineligible',
    shortlisted: 'Shortlisted',
    selected: 'Selected',
    rejected: 'Rejected'
  };
  return map[state.toLowerCase()] || state.charAt(0).toUpperCase() + state.slice(1);
}

// ─── Schemes ─────────────────────────────────────────────────────────────────

export async function getPublishedSchemes(): Promise<any[]> {
  if (!isLive) return mockSchemes.filter((s: any) => s.status === 'Published');

  const { data, error } = await supabase
    .from('scheme_versions')
    .select('*, schemes(*)')
    .eq('status', 'published');

  if (error) {
    console.warn('[db] getPublishedSchemes live error, falling back to mock:', error.message);
    return mockSchemes.filter((s: any) => s.status === 'Published');
  }

  // If live DB returns empty, fall back to mock data so the app is not broken
  if (!data || data.length === 0) {
    console.info('[db] No published scheme_versions in live DB, using mock schemes');
    return mockSchemes.filter((s: any) => s.status === 'Published');
  }

  return data.map((d: any) => ({
    id: d.schemes?.code?.toLowerCase() ?? d.id,
    name: d.schemes?.name ?? '',
    shortName: d.schemes?.code ?? '',
    version: `v${d.version}`,
    status: 'Published',
    config: d.config ?? {},
    closingDate: d.effective_to ?? null,
    lastUpdated: d.created_at ?? null,
    applicationsCount: 0,
    description: d.schemes?.description || ''
  }));
}

export async function getAllSchemes(): Promise<any[]> {
  if (!isLive) return mockSchemes;

  const { data, error } = await supabase.from('schemes').select('*, scheme_versions(*)');
  if (error) {
    console.warn('[db] getAllSchemes live error, falling back to mock:', error.message);
    return mockSchemes;
  }
  if (!data || data.length === 0) {
    console.info('[db] No schemes in live DB, using mock');
    return mockSchemes;
  }
  return data;
}

export async function getSchemeById(id: string): Promise<any | undefined> {
  if (!isLive) return mockSchemes.find((s: any) => s.id === id || s.shortName === id);

  const { data, error } = await supabase
    .from('schemes')
    .select('*, scheme_versions(*)')
    .eq('code', id.toUpperCase())
    .maybeSingle();

  if (error) {
    console.warn('[db] getSchemeById live error, falling back to mock:', error.message);
    return mockSchemes.find((s: any) => s.id === id || s.shortName === id);
  }

  if (data) {
    const latestVersion = data.scheme_versions?.find((v: any) => v.status === 'published') || data.scheme_versions?.[0];
    return {
      id: data.code?.toLowerCase() || id,
      name: data.name,
      shortName: data.code,
      version: latestVersion ? `v${latestVersion.version}` : 'v1',
      status: 'Published',
      config: latestVersion?.config || {},
      description: data.description || ''
    };
  }

  return mockSchemes.find((s: any) => s.id === id || s.shortName?.toLowerCase() === id.toLowerCase());
}

// ─── Applications ──────────────────────────────────────────────────────────

export async function getApplications(
  params: { schemeId?: string; status?: string; search?: string; applicantId?: string } = {}
): Promise<any[]> {
  if (!isLive) {
    let apps = [...mockApplications];
    if (params.schemeId) apps = apps.filter(a => a.schemeId === params.schemeId);
    if (params.status) apps = apps.filter((a: any) => a.status === params.status);
    if (params.applicantId) apps = apps.filter((a: any) => a.applicantId === params.applicantId);
    if (params.search) {
      const q = String(params.search).toLowerCase();
      apps = apps.filter(
        (a: any) =>
          a.id?.toLowerCase().includes(q) ||
          a.applicantName?.toLowerCase().includes(q) ||
          a.schemeName?.toLowerCase().includes(q)
      );
    }
    return apps;
  }

  let query = supabase
    .from('applications')
    .select('id, applicant_id, form_data, current_state, submitted_at, assigned_officer_id');

  if (params.status) query = (query as any).eq('current_state', params.status.toLowerCase().replace(/ /g, '_'));
  if (params.applicantId) query = (query as any).eq('applicant_id', params.applicantId);

  const { data, error } = await query;
  if (error) {
    console.warn('[db] getApplications live error, falling back to mock:', error.message);
    return [...mockApplications];
  }

  // Normalize live data rows
  const liveApps = (data || []).map(normalizeApp);

  // Demo records do not belong in a user-scoped live query.
  const liveIds = new Set(liveApps.map((a: any) => a.id));
  let mockFiltered = params.applicantId ? [] : mockApplications.filter((a: any) => !liveIds.has(a.id));

  if (params.schemeId) mockFiltered = mockFiltered.filter((a: any) => a.schemeId === params.schemeId);
  if (params.status) mockFiltered = mockFiltered.filter((a: any) => a.status === params.status);
  if (params.search) {
    const q = String(params.search).toLowerCase();
    mockFiltered = mockFiltered.filter(
      (a: any) =>
        a.id?.toLowerCase().includes(q) ||
        a.applicantName?.toLowerCase().includes(q) ||
        a.schemeName?.toLowerCase().includes(q)
    );
  }

  return [...liveApps, ...mockFiltered];
}

export async function getScrutinyQueue(): Promise<any[]> {
  const all = await getApplications();
  return all.filter((a: any) => ['Submitted', 'Under Scrutiny', 'Deficiency'].includes(a.status));
}

export async function getApplicationById(id: string): Promise<any | undefined> {
  if (!isLive) return mockApplications.find((a: any) => a.id === id);

  // First check mock apps (since they have rich data)
  const mockMatch = mockApplications.find((a: any) => a.id === id);
  if (mockMatch) return mockMatch;

  const { data, error } = await supabase
    .from('applications')
    .select('*, documents(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('[db] getApplicationById live error:', error.message);
    return undefined;
  }

  return data ? normalizeApp(data) : undefined;
}

export async function addApplication(newApp: any): Promise<any> {
  if (!isLive) {
    mockAddApp(newApp);
    return newApp;
  }

  const { data, error } = await supabase.from('applications').insert([
    {
      form_data: newApp.formData,
      applicant_id: newApp.applicantId,
      current_state: (newApp.status || 'submitted').toLowerCase(),
    },
  ]).select('id').single();

  if (error) {
    console.warn('[db] addApplication live error, falling back to mock:', error.message);
    mockAddApp(newApp);
    return newApp;
  }
  return { ...newApp, id: data.id };
}

export async function updateApplication(id: string, updates: any): Promise<any> {
  if (!isLive) {
    mockUpdateApp(id, updates);
    return;
  }

  const payload: any = {};
  if (updates.status) payload.current_state = updates.status.toLowerCase().replace(/ /g, '_');
  if (updates.formData) payload.form_data = updates.formData;
  if (updates.documents) payload.form_data = { ...(updates.formData || {}), documents: updates.documents };

  const { error } = await supabase.from('applications').update(payload).eq('id', id);
  if (error) {
    console.warn('[db] updateApplication live error:', error.message);
  }
  // Also update mock store for the demo records
  mockUpdateApp(id, updates);
}

export async function getProfile(id: string): Promise<any | undefined> {
  const { data, error } = await supabase.from('profiles').select('id, role, full_name, phone, state, preferred_language').eq('id', id).maybeSingle();
  if (error) throw error;
  return data || undefined;
}

export async function updateProfile(id: string, updates: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select('id, role, full_name, phone, state, preferred_language').single();
  if (error) throw error;
  return data;
}
