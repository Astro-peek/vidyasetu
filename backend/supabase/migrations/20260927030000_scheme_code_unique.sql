ALTER TABLE schemes ADD CONSTRAINT schemes_code_unique UNIQUE (code);

CREATE INDEX IF NOT EXISTS applications_applicant_id_idx ON applications (applicant_id);
CREATE INDEX IF NOT EXISTS applications_current_state_idx ON applications (current_state);
CREATE INDEX IF NOT EXISTS applications_scheme_version_id_idx ON applications (scheme_version_id);
CREATE INDEX IF NOT EXISTS scheme_versions_scheme_id_status_idx ON scheme_versions (scheme_id, status);
