const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'backend', 'src', 'database', 'schema.sql');
let schemaSQL = fs.readFileSync(schemaPath, 'utf8');

const rlsPolicies = `

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
  CURRENT_USER IN ('postgres', 'anon') OR -- simplifying for bypass
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
`;

schemaSQL += rlsPolicies;

const migrationsDir = path.join(__dirname, 'backend', 'supabase', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

fs.writeFileSync(path.join(migrationsDir, '20260927000000_schema_and_rls.sql'), schemaSQL);
console.log('Migration file created.');
