-- =============================================================================
-- SUPER_ADMIN — database-only role (NOT on signup page)
-- Full access: Admin, approvals, onboarding, events, collaborate.
-- UI hides Student Dashboard for this role.
-- =============================================================================

INSERT INTO roles (name, description)
SELECT 'SUPER_ADMIN', 'System super administrator — full access, database only'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SUPER_ADMIN');

INSERT INTO roles (name, description)
SELECT 'EVENT_MEMBER', 'Onboarding / venue check-in team member'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'EVENT_MEMBER');

-- Option A (recommended for local dev): enable in application.yml:
--   app.bootstrap.super-admin.email: admin@meu.edu.in
--   app.bootstrap.super-admin.password: Admin@MEU2026!
-- Restart the backend once; user is created with a real BCrypt hash.

-- Option B (manual SQL): insert into users with role_id = SUPER_ADMIN id
-- and password_hash = BCrypt output of your chosen password.
-- Example columns: email, password_hash, first_name, last_name, college_id, role_id,
--                  is_active=1, email_verified=1
