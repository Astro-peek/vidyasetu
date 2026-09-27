/**
 * VidyaSetu API Client
 * Connects the frontend to the Express backend (VITE_API_BASE_URL).
 * All Gemini and Supabase service-role operations are backend-only.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// ── Auth helpers ──────────────────────────────────────────────────────────────

function getToken() {
  // 1. Try real Supabase session
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (keys.length) {
      const session = JSON.parse(localStorage.getItem(keys[0]) || '{}');
      if (session?.access_token) return session.access_token;
    }
  } catch { /* ignore */ }

  // 2. Fall back to demo-role token so backend accepts requests in demo mode
  const demoRole = localStorage.getItem('demo-role');
  if (demoRole) return `demo-${demoRole}`;

  return null;
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-Correlation-Id': crypto.randomUUID?.() || Date.now().toString()
  };
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { ...authHeaders(), ...options.headers };

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on port 3001.');
  }

  if (res.status === 401) {
    window.dispatchEvent(new Event('vs:session-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { success: false, message: text }; }

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }

  return json.data !== undefined ? json.data : json;
}

// ── Schemes ───────────────────────────────────────────────────────────────────

export const api = {
  getMe: () => apiFetch('/me'),
  updateMe: (payload) => apiFetch('/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  // Published schemes for applicants
  getSchemes: () => apiFetch('/schemes'),

  // All schemes for admin
  getAllSchemes: () => apiFetch('/schemes/all'),

  getScheme: (id) => apiFetch(`/schemes/${id}`),

  // Rendered form definition (sections + documents) for dynamic form renderer
  getSchemeForm: (id) => apiFetch(`/schemes/${id}/form`),

  // ── Applications ────────────────────────────────────────────────────────────

  getApplications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/applications${qs ? `?${qs}` : ''}`);
  },

  getApplication: (id) => apiFetch(`/applications/${id}`),

  submitApplication: (payload) => apiFetch('/applications', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  updateApplication: (id, updates) => apiFetch(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),

  getApplicationTimeline: (id) => apiFetch(`/applications/${id}/timeline`),

  // ── Scrutiny ────────────────────────────────────────────────────────────────

  getScrutinyQueue: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/scrutiny-queue${qs ? `?${qs}` : ''}`);
  },

  transitionApplication: (id, to, reason) => apiFetch(`/applications/${id}/transition`, {
    method: 'POST',
    body: JSON.stringify({ to, reason })
  }),

  // ── Rules evaluation ────────────────────────────────────────────────────────

  evaluateApplication: (id) => apiFetch(`/applications/${id}/evaluate`, { method: 'POST' }),
  getEvaluation: (id) => apiFetch(`/applications/${id}/evaluation`),

  // ── Deficiencies ────────────────────────────────────────────────────────────

  raiseDeficiency: (id, payload) => apiFetch(`/applications/${id}/deficiencies`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // ── Dashboard / Analytics ───────────────────────────────────────────────────

  getDashboardStats: () => apiFetch('/dashboard/stats'),
  getAnalyticsOverview: () => apiFetch('/analytics/overview'),

  // ── Notifications ───────────────────────────────────────────────────────────

  getNotifications: () => apiFetch('/notifications'),

  // ── AI Assistant ────────────────────────────────────────────────────────────

  chatWithAssistant: (message, role = 'applicant') => apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, role })
  }),

  // ── Documents ───────────────────────────────────────────────────────────────
  
  uploadDocument: (formData) => apiFetch('/documents/upload', {
    method: 'POST',
    // Do not set Content-Type to allow browser to correctly set multipart/form-data boundary
    headers: { ...authHeaders(), 'Content-Type': undefined },
    body: formData
  }),

  // ── Grievances ──────────────────────────────────────────────────────────────

  getGrievances: () => apiFetch('/grievances'),
  createGrievance: (payload) => apiFetch('/grievances', { method: 'POST', body: JSON.stringify(payload) }),
  replyToGrievance: (id, message) => apiFetch(`/grievances/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message })
  }),

  // ── Health ──────────────────────────────────────────────────────────────────

  healthCheck: () => apiFetch('/health')
};
