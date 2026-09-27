-- Supabase Schema for VidyaSetu

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('applicant', 'scrutiny_officer', 'scheme_admin', 'committee_member', 'institution_verifier', 'finance_officer', 'ministry_viewer', 'super_admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  state TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  institution_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Institutions Table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('india', 'foreign')),
  reference_code TEXT,
  status TEXT DEFAULT 'active'
);

-- 3. Reference Lists Table
CREATE TABLE reference_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  version INT NOT NULL,
  items JSONB NOT NULL,
  source_ref TEXT,
  effective_from DATE
);

-- 4. Schemes Table
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active'
);

-- 5. Scheme Versions Table
CREATE TABLE scheme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID REFERENCES schemes(id),
  version INT NOT NULL,
  config JSONB NOT NULL,
  source_ref TEXT,
  effective_from DATE,
  effective_to DATE,
  status TEXT CHECK (status IN ('draft', 'approved', 'published', 'retired')),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Applications Table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_version_id UUID REFERENCES scheme_versions(id),
  applicant_id UUID REFERENCES profiles(id),
  form_data JSONB,
  current_state TEXT NOT NULL DEFAULT 'submitted',
  assigned_officer_id UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  sla_due_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  requirement_key TEXT NOT NULL,
  doc_type TEXT,
  storage_path TEXT NOT NULL,
  version INT DEFAULT 1,
  status TEXT DEFAULT 'pending'
);

-- 8. Document Extractions Table
CREATE TABLE document_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  model TEXT,
  fields JSONB,
  per_field_confidence JSONB,
  quality_flags JSONB,
  raw_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Rule Evaluations Table
CREATE TABLE rule_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  scheme_version_id UUID REFERENCES scheme_versions(id),
  overall_result TEXT CHECK (overall_result IN ('eligible', 'ineligible', 'needs_review')),
  results JSONB,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI Flags Table
CREATE TABLE ai_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  document_id UUID REFERENCES documents(id),
  type TEXT CHECK (type IN ('missing_page', 'mismatch', 'low_quality', 'duplicate_suspect')),
  severity TEXT,
  evidence JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'confirmed', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id)
);

-- 11. Deficiencies Table
CREATE TABLE deficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  raised_by UUID REFERENCES profiles(id),
  items JSONB NOT NULL,
  status TEXT DEFAULT 'open',
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- 12. Selections Table
CREATE TABLE selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  merit_score NUMERIC,
  score_breakdown JSONB,
  rank INT,
  committee_decision TEXT,
  remarks TEXT,
  decided_by UUID REFERENCES profiles(id)
);

-- 13. Audit Events Table
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id),
  correlation_id TEXT,
  actor_id TEXT,
  actor_type TEXT,
  action TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  reason TEXT,
  evidence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to prevent UPDATE/DELETE on audit_events
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_mod
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view their own profile, officers/admins can view all. Users can update their own profile.
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins and officers can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('scrutiny_officer', 'scheme_admin', 'super_admin'))
);
CREATE POLICY "Users can insert/update own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- 2. Schemes & Scheme_Versions: Everyone can view published ones. Admins can view/edit all.
CREATE POLICY "Public can view published schemes" ON schemes FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view published scheme versions" ON scheme_versions FOR SELECT USING (status = 'published');

-- 3. Applications: Applicants can view/edit their own. Officers can view/edit all.
CREATE POLICY "Applicants can view own applications" ON applications FOR SELECT USING (applicant_id = auth.uid());
CREATE POLICY "Applicants can insert own applications" ON applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "Applicants can update own applications" ON applications FOR UPDATE USING (applicant_id = auth.uid());
CREATE POLICY "Officers can view/edit all applications" ON applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('scrutiny_officer', 'scheme_admin', 'super_admin'))
);

-- 4. Documents: Applicants can view/insert for their apps. Officers view/edit all.
CREATE POLICY "Applicants can view own docs" ON documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM applications a WHERE a.id = documents.application_id AND a.applicant_id = auth.uid())
);
CREATE POLICY "Applicants can insert own docs" ON documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM applications a WHERE a.id = documents.application_id AND a.applicant_id = auth.uid())
);
CREATE POLICY "Officers can view/edit all docs" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('scrutiny_officer', 'scheme_admin', 'super_admin'))
);

-- Note: In a real system, similar policies would apply to ai_flags, deficiencies, etc.
-- For now, they are readable/writable largely by officers, or read-only by the applicant.
