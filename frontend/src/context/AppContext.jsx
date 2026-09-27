import { createContext, useState, useContext, useEffect } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';
import { api } from '../services/api';

const AppContext = createContext();
const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch { return fallback; }
};

export const AppProvider = ({ children }) => {
  const [role, setRoleState] = useState(() => localStorage.getItem('demo-role'));
  const [authLoading, setAuthLoading] = useState(supabaseConfigured);
  const [lang, setLang] = useState('en'); // 'en' or 'hi'
  const [studentProfile, setStudentProfile] = useState(() => readStored('vs-profile', {}));
  const [studentApplications, setStudentApplications] = useState(() => readStored('vs-applications', []));
  const [drafts, setDrafts] = useState(() => readStored('vs-drafts', {}));
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantTab, setAssistantTab] = useState('chat');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('vidya-setu-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('vidya-setu-theme', theme); } catch { /* storage can be unavailable */ }
  }, [theme]);

  useEffect(() => { try { localStorage.setItem('vs-profile', JSON.stringify(studentProfile)); } catch { /* storage unavailable */ } }, [studentProfile]);
  useEffect(() => { try { localStorage.setItem('vs-applications', JSON.stringify(studentApplications)); } catch { /* storage unavailable */ } }, [studentApplications]);
  useEffect(() => { try { localStorage.setItem('vs-drafts', JSON.stringify(drafts)); } catch { /* storage unavailable */ } }, [drafts]);

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return undefined; }
    let active = true;
    const loadProfile = async session => {
      if (!session) { if (active) { setRole(null); setAuthLoading(false); } return; }
      try {
        const profile = await api.getMe();
        if (active) { setRole(profile.role); setStudentProfile(current => ({ ...current, fullName: profile.full_name || current.fullName, phone: profile.phone || current.phone, state: profile.state || current.state })); }
      } catch {
        if (active) setRole(null);
      } finally { if (active) setAuthLoading(false); }
    };
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => loadProfile(session));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const saveDraft = (schemeId, data) => setDrafts(current => ({ ...current, [schemeId]: data }));
  const submitApplication = (scheme, formData, documents) => {
    const record = {
      id: `${scheme.shortName}-${Date.now().toString(36).toUpperCase()}`,
      schemeId: scheme.id, schemeName: scheme.name, submittedDate: new Date().toISOString(),
      status: 'Submitted', formData, documents, timeline: [
        { time: new Date().toLocaleString(), actor: 'Student', role: 'applicant', action: 'Application submitted', details: 'Your demo application is ready for review.' },
      ],
    };
    setStudentApplications(current => [record, ...current]);
    setDrafts(current => { const next = { ...current }; delete next[scheme.id]; return next; });
    return record.id;
  };

  const respondToDeficiency = (id, fileName) => setStudentApplications(current => current.map(app => app.id === id ? {
    ...app, status: 'Under Scrutiny', documents: app.documents.map(doc => doc.status === 'Flagged' ? { ...doc, status: 'Ready', name: fileName } : doc),
    timeline: [...(app.timeline || []), { time: new Date().toLocaleString(), actor: 'Student', role: 'applicant', action: 'Corrected document submitted', details: fileName }],
  } : app));

  const updateApplicationStatus = (id, status, remarks = '') => {
    const next = studentApplications.map(app => app.id === id ? {
      ...app, status,
      documents: status === 'Deficiency' ? app.documents.map((doc, index) => index === 0 ? { ...doc, status: 'Flagged', officerRemark: remarks || 'Please provide a clearer document.' } : doc) : app.documents,
      timeline: [...(app.timeline || []), { time: new Date().toLocaleString(), actor: 'Demo officer', role: 'officer', action: status === 'Deficiency' ? 'Document correction requested' : `Marked ${status}`, details: remarks }],
    } : app);
    setStudentApplications(next);
    try { localStorage.setItem('vs-applications', JSON.stringify(next)); } catch { /* storage unavailable */ }
  };

  // Persist role to localStorage so API token helper can send demo-<role> bearer
  const setRole = (newRole) => {
    if (newRole) {
      try { localStorage.setItem('demo-role', newRole); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem('demo-role'); } catch { /* ignore */ }
    }
    setRoleState(newRole);
  };

  const t = (enText, hiText) => {
    return lang === 'hi' && hiText ? hiText : enText;
  };
  const openAssistant = (tab = 'chat') => { setAssistantTab(tab); setAssistantOpen(true); };
  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setRole(null); };

  return (
    <AppContext.Provider value={{ role, setRole, authLoading, lang, setLang, theme, setTheme, studentProfile, setStudentProfile, studentApplications, submitApplication, respondToDeficiency, updateApplicationStatus, drafts, saveDraft, t, assistantOpen, setAssistantOpen, assistantTab, setAssistantTab, openAssistant, signOut }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
