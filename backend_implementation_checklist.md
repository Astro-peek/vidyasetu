# Backend Implementation Checklist

## Frontend Requirements
- [ ] Update `frontend/src/services/api.js` to call the real backend instead of returning mocked data.
- [ ] Connect `getSchemes()`, `getScheme(id)`, `getApplications()`, `getApplication(id)`, `getScrutinyQueue()`, and `getDashboardStats()` to the backend endpoints.
- [ ] Ensure Supabase JWT authentication is properly configured in the frontend to attach to API requests as Bearer token.
- [ ] Ensure frontend can upload documents properly to backend or Supabase storage wrapper.
- [ ] Connect forms, buttons, dashboard, table, charts, filters to backend endpoints as per the PRD.

## API Endpoints
- [ ] `GET/PATCH /api/v1/me`, `GET/POST /api/v1/users`
- [ ] Scheme CRUD operations: `GET /schemes`, `POST /schemes`, `POST /schemes/:id/versions`, etc.
- [ ] App operations: `POST /applications`, `GET /applications/:id`, `PATCH /applications/:id`
- [ ] Documents: Upload, status viewing, trigger reprocessing.
- [ ] AI integration endpoints for document parsing and rules execution: `POST /applications/:id/evaluate`
- [ ] Workflow, Deficiencies, Notifications, Settings, Dashboard aggregates endpoints.

## Database (Supabase / Postgres)
- [ ] Create `profiles` table schema and RLS
- [ ] Create `schemes`, `scheme_versions`, `reference_lists` tables
- [ ] Create `applications` table referencing schemes and applicants
- [ ] Create `documents` and `document_extractions` tables
- [ ] Create `rule_evaluations`, `ai_flags`, `deficiencies` tables
- [ ] Setup DB triggers for `audit_events` (append-only)
- [ ] Create Supabase migrations.

## AI Integration (Gemini)
- [ ] Write integration module `backend/src/integrations/gemini/index.js`.
- [ ] Securely pass `GEMINI_API_KEY` from `.env`.
- [ ] Create prompt templates for extracting data from various document types (Income Cert, Aadhar, etc).
- [ ] Handle failures, retries, schemas (Zod).

## Data & Ingestion
- [ ] Review `MoTA_Scholarship_Official_Data_Pack_2026-09-24.pdf`.
- [ ] Create synthetic data generator/ingestor to seed the database with scheme config, rules, and example applications (since actual user data won't be used, as per PRD).

## Security & Auth
- [ ] Implement robust auth middleware verifying Supabase JWT.
- [ ] Role checks using profile data or app_metadata mapping.
- [ ] CORS config for the frontend API URL.
- [ ] Input validation using Zod.

## Testing
- [ ] Write unit tests for the Rule Evaluator.
- [ ] Write integration tests for API endpoints.
- [ ] Ensure successful running of backend and frontend together.
