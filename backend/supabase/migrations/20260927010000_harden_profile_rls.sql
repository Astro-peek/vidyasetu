-- Remove the anonymous profile-read bypass from the initial schema migration.
DROP POLICY IF EXISTS "Admins and officers can view all profiles" ON profiles;

CREATE POLICY "Staff can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('scrutiny_officer', 'scheme_admin', 'super_admin')
    )
  );
