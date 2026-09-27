import { Router } from 'express';
import {
  getSchemes,
  getAllSchemes,
  getSchemeById,
  getSchemeForm,
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationRoute,
  getApplicationTimeline,
  getScrutinyQueue,
  transitionApplication,
  evaluateApplication,
  getEvaluation,
  raiseDeficiency,
  getDashboardStats,
  getAnalyticsOverview,
  getNotifications,
  chatWithAssistant,
  createGrievance,
  getGrievances,
  replyToGrievance,
  getMe,
  updateMe,
  healthCheck,
  uploadDocument
} from '../controllers/api.controller';
import { authenticate, requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(authenticate);

const staffRoles = ['scrutiny_officer', 'scheme_admin', 'committee_member', 'ministry_viewer', 'super_admin'];
const reviewRoles = ['scrutiny_officer', 'scheme_admin', 'super_admin'];

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', healthCheck);
router.get('/ready', healthCheck);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);

// ─── Schemes ─────────────────────────────────────────────────────────────────
router.get('/schemes', getSchemes);              // published only (applicants + public)
router.get('/schemes/all', requireAuth, requireRole('scheme_admin', 'super_admin'), getAllSchemes);
router.get('/schemes/:id', getSchemeById);
router.get('/schemes/:id/form', getSchemeForm);  // rendered form definition for applicant

// ─── Applications ─────────────────────────────────────────────────────────────
router.get('/applications', requireAuth, requireRole('applicant', ...staffRoles), getApplications);
router.post('/applications', requireAuth, requireRole('applicant'), createApplication);
router.get('/applications/:id', requireAuth, requireRole('applicant', ...staffRoles), getApplicationById);
router.patch('/applications/:id', requireAuth, requireRole(...reviewRoles), updateApplicationRoute);
router.get('/applications/:id/timeline', requireAuth, requireRole('applicant', ...staffRoles), getApplicationTimeline);

// ─── Documents ────────────────────────────────────────────────────────────────
router.post('/documents/upload', requireAuth, requireRole('applicant'), upload.single('file'), uploadDocument);

// ─── Scrutiny ─────────────────────────────────────────────────────────────────
router.get('/scrutiny-queue', requireAuth, requireRole(...reviewRoles), getScrutinyQueue);
router.post('/applications/:id/transition', requireAuth, requireRole(...reviewRoles), transitionApplication);

// ─── Rules evaluation ─────────────────────────────────────────────────────────
router.post('/applications/:id/evaluate', requireAuth, requireRole(...reviewRoles), evaluateApplication);
router.get('/applications/:id/evaluation', requireAuth, requireRole('applicant', ...reviewRoles), getEvaluation);

// ─── Deficiencies ─────────────────────────────────────────────────────────────
router.post('/applications/:id/deficiencies', requireAuth, requireRole(...reviewRoles), raiseDeficiency);

// ─── Dashboard / Analytics ────────────────────────────────────────────────────
router.get('/dashboard/stats', requireAuth, requireRole(...staffRoles), getDashboardStats);
router.get('/analytics/overview', requireAuth, requireRole(...staffRoles), getAnalyticsOverview);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', requireAuth, getNotifications);

// ─── AI Assistant ─────────────────────────────────────────────────────────────
router.post('/ai/chat', requireAuth, chatWithAssistant);

// ─── Grievances ───────────────────────────────────────────────────────────────
router.get('/grievances', requireAuth, getGrievances);
router.post('/grievances', requireAuth, requireRole('applicant'), createGrievance);
router.post('/grievances/:id/reply', requireAuth, requireRole(...staffRoles), replyToGrievance);

export default router;
