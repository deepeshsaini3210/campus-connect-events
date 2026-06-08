-- =============================================================================
-- MU Events Portal — seed data (matches your 6 roles)
-- Run: mysql -u root -p event < backend/seed-mu-portal.sql
-- Change database name below if yours is different (e.g. event_discovery_db)
-- =============================================================================
USE event;

-- -----------------------------------------------------------------------------
-- 1) Roles (you already have these — safe to re-run)
-- Signup page: role_id 1=STUDENT, 3=EVENT_ORGANIZER, 6=EVENT_MEMBER
-- DB-only:     role_id 2=COLLEGE_ADMIN, 4=EXTERNAL_PARTNER, 5=SUPER_ADMIN
-- -----------------------------------------------------------------------------
INSERT INTO roles (name, description) VALUES
('STUDENT', 'Student user'),
('COLLEGE_ADMIN', 'College administrator'),
('EVENT_ORGANIZER', 'Event organizer'),
('EXTERNAL_PARTNER', 'External college partner'),
('SUPER_ADMIN', 'System super administrator — full access, database only'),
('EVENT_MEMBER', 'Onboarding / venue check-in team member')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- -----------------------------------------------------------------------------
-- 2) Colleges
-- -----------------------------------------------------------------------------
INSERT INTO colleges (name, code, type, city, state, country, is_active, created_at, updated_at)
SELECT * FROM (
  SELECT 'Mandsaur University' AS name, 'MU' AS code, 'UNIVERSITY' AS type, 'Mandsaur' AS city, 'MP' AS state, 'India' AS country, TRUE AS is_active, NOW() AS created_at, NOW() AS updated_at
  UNION ALL SELECT 'IIT Indore', 'IITI', 'INSTITUTE', 'Indore', 'MP', 'India', TRUE, NOW(), NOW()
  UNION ALL SELECT 'DAVV Indore', 'DAVV', 'UNIVERSITY', 'Indore', 'MP', 'India', TRUE, NOW(), NOW()
  UNION ALL SELECT 'IIM Indore', 'IIMI', 'INSTITUTE', 'Indore', 'MP', 'India', TRUE, NOW(), NOW()
  UNION ALL SELECT 'MITS Gwalior', 'MITS', 'INSTITUTE', 'Gwalior', 'MP', 'India', TRUE, NOW(), NOW()
  UNION ALL SELECT 'SGSITS Indore', 'SGSITS', 'INSTITUTE', 'Indore', 'MP', 'India', TRUE, NOW(), NOW()
  UNION ALL SELECT 'Medi-Caps University', 'MEDICAPS', 'UNIVERSITY', 'Indore', 'MP', 'India', TRUE, NOW(), NOW()
) c
WHERE NOT EXISTS (SELECT 1 FROM colleges x WHERE x.code = c.code);

-- -----------------------------------------------------------------------------
-- 3) Event categories
-- -----------------------------------------------------------------------------
INSERT INTO event_categories (name, description, color, icon, is_active) VALUES
('Technical', 'Technical events', '#3B82F6', 'laptop', TRUE),
('Cultural', 'Cultural events', '#EC4899', 'music', TRUE),
('Sports', 'Sports events', '#10B981', 'trophy', TRUE),
('Workshop', 'Workshops', '#6366F1', 'wrench', TRUE),
('Seminar', 'Seminars', '#F59E0B', 'presentation', TRUE),
('Hackathon', 'Hackathons', '#8B5CF6', 'code', TRUE),
('Fest', 'Fests', '#EF4444', 'calendar', TRUE),
('Placement', 'Placement', '#14B8A6', 'briefcase', TRUE),
('Competition', 'Competitions', '#64748B', 'award', TRUE)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- -----------------------------------------------------------------------------
-- 4) Users (password for all below: password — BCrypt hash)
-- Change passwords in production!
--
-- *** FULL AUTHORITY ADMIN (signup se nahi banta — sirf database) ***
--   Email: admin@meu.edu.in
--   Role:  SUPER_ADMIN (id = 5)
--   Nav:   System Admin + Onboarding + sab pages (Student Dashboard nahi)
-- -----------------------------------------------------------------------------
INSERT INTO users (email, password_hash, first_name, last_name, role_id, college_id, is_active, email_verified, created_at, updated_at)
SELECT 'admin@meu.edu.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator',
  (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'), (SELECT id FROM colleges WHERE code = 'MU'), TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@meu.edu.in');

-- Agar admin user pehle se hai galat role ke sath, role fix karo:
UPDATE users u
SET u.role_id = (SELECT id FROM roles WHERE name = 'SUPER_ADMIN' LIMIT 1),
    u.is_active = TRUE,
    u.email_verified = TRUE
WHERE u.email = 'admin@meu.edu.in';

INSERT INTO users (email, password_hash, first_name, last_name, role_id, college_id, is_active, email_verified, created_at, updated_at)
SELECT 'college.admin@meu.edu.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'College', 'Admin',
  (SELECT id FROM roles WHERE name = 'COLLEGE_ADMIN'), (SELECT id FROM colleges WHERE code = 'MU'), TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'college.admin@meu.edu.in');

INSERT INTO users (email, password_hash, first_name, last_name, role_id, college_id, is_active, email_verified, created_at, updated_at)
SELECT 'organizer@meu.edu.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Event', 'Organizer',
  (SELECT id FROM roles WHERE name = 'EVENT_ORGANIZER'), (SELECT id FROM colleges WHERE code = 'MU'), TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'organizer@meu.edu.in');

INSERT INTO users (email, password_hash, first_name, last_name, role_id, college_id, is_active, email_verified, created_at, updated_at)
SELECT 'gate@meu.edu.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Gate', 'Staff',
  (SELECT id FROM roles WHERE name = 'EVENT_MEMBER'), (SELECT id FROM colleges WHERE code = 'MU'), TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'gate@meu.edu.in');

INSERT INTO users (email, password_hash, first_name, last_name, role_id, college_id, is_active, email_verified, created_at, updated_at)
SELECT 'student@meu.edu.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'Student',
  (SELECT id FROM roles WHERE name = 'STUDENT'), (SELECT id FROM colleges WHERE code = 'MU'), TRUE, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@meu.edu.in');

-- -----------------------------------------------------------------------------
-- 5) Approved events (dates relative to today — always visible on calendar)
-- -----------------------------------------------------------------------------
INSERT INTO events (
  title, description, category_id, organizer_id, college_id,
  event_date, event_time, venue, mode, fee, seats_total, seats_left,
  deadline, status, is_featured, is_partner_event, image_url, created_at, updated_at
)
SELECT
  d.title, d.description,
  (SELECT id FROM event_categories WHERE name = d.category_name LIMIT 1),
  (SELECT id FROM users WHERE email = 'organizer@meu.edu.in' LIMIT 1),
  (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1),
  d.event_date, d.event_time, d.venue, d.mode, d.fee, d.seats_total, d.seats_left,
  d.deadline, 'APPROVED', d.is_featured, FALSE, d.image_url, NOW(), NOW()
FROM (
  SELECT
    'InnovateX 2026 — Hackathon' AS title,
    '36-hour national hackathon at MU.' AS description,
    'Hackathon' AS category_name,
    DATE_ADD(CURDATE(), INTERVAL 14 DAY) AS event_date,
    '09:00:00' AS event_time,
    'Engineering Auditorium' AS venue,
    'OFFLINE' AS mode,
    0.00 AS fee, 200 AS seats_total, 200 AS seats_left,
    DATE_ADD(CURDATE(), INTERVAL 10 DAY) AS deadline,
    TRUE AS is_featured,
    '/images/event-tech.jpg' AS image_url
  UNION ALL SELECT
    'Sanskriti Cultural Fest',
    'Annual cultural fest — music, dance, drama.',
    'Fest',
    DATE_ADD(CURDATE(), INTERVAL 21 DAY),
    '18:00:00',
    'Open Air Theatre',
    'OFFLINE', 199.00, 500, 500,
    DATE_ADD(CURDATE(), INTERVAL 18 DAY),
    TRUE,
    '/images/event-cultural.jpg'
  UNION ALL SELECT
    'Robotics Workshop',
    'Build and program your first robot.',
    'Workshop',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    '10:00:00',
    'Robotics Lab',
    'OFFLINE', 499.00, 40, 40,
    DATE_ADD(CURDATE(), INTERVAL 5 DAY),
    FALSE,
    '/images/event-workshop.jpg'
  UNION ALL SELECT
    'Inter-College Cricket Finals',
    'Inter-university cricket championship.',
    'Sports',
    DATE_ADD(CURDATE(), INTERVAL 3 DAY),
    '08:00:00',
    'MU Sports Ground',
    'OFFLINE', 0.00, 300, 300,
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    FALSE,
    '/images/event-sports.jpg'
  UNION ALL SELECT
    'AI Career Seminar',
    'Industry leaders on AI careers.',
    'Seminar',
    DATE_ADD(CURDATE(), INTERVAL 10 DAY),
    '11:00:00',
    'Convention Hall',
    'HYBRID', 0.00, 150, 150,
    DATE_ADD(CURDATE(), INTERVAL 8 DAY),
    TRUE,
    '/images/event-seminar.jpg'
) d
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.title = d.title AND e.event_date = d.event_date
);

-- -----------------------------------------------------------------------------
-- 6) Testimonials (homepage)
-- -----------------------------------------------------------------------------
INSERT INTO testimonials (full_name, role, quote, is_featured, display_order)
SELECT * FROM (
  SELECT 'Priya Sharma' AS full_name, 'B.Tech CSE, 3rd Year' AS role,
    'I registered for InnovateX through MU Events — smooth booking and QR entry.' AS quote,
    TRUE AS is_featured, 1 AS display_order
  UNION ALL SELECT 'Aarav Patel', 'MBA, 2nd Year',
    'Collaboration offers from partner colleges saved me on fest tickets.', TRUE, 2
  UNION ALL SELECT 'Dr. Meera Joshi', 'Faculty Coordinator',
    'Admin approvals and onboarding check-in work well for our team.', TRUE, 3
) t
WHERE NOT EXISTS (SELECT 1 FROM testimonials x WHERE x.full_name = t.full_name);

-- -----------------------------------------------------------------------------
-- 7) Approved collaboration (partner colleges on homepage)
-- -----------------------------------------------------------------------------
INSERT INTO collaborations (requester_college_id, partner_college_id, status, request_date, response_date, special_offers, notes, updated_at)
SELECT
  (SELECT id FROM colleges WHERE code = 'MU'),
  (SELECT id FROM colleges WHERE code = 'IITI'),
  'APPROVED', NOW(), NOW(),
  '30% discount on paid events for MU students',
  'Seeded offer', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM collaborations c
  WHERE c.requester_college_id = (SELECT id FROM colleges WHERE code = 'MU')
    AND c.partner_college_id = (SELECT id FROM colleges WHERE code = 'IITI')
);

-- -----------------------------------------------------------------------------
-- 8) Fix orphan organizer_id (events must reference an existing user)
-- -----------------------------------------------------------------------------
UPDATE events e
LEFT JOIN users u ON u.id = e.organizer_id
SET e.organizer_id = COALESCE(
    (SELECT id FROM users WHERE email = 'organizer@meu.edu.in' LIMIT 1),
    (SELECT MIN(id) FROM users)
)
WHERE u.id IS NULL;

-- Remove bookings pointing to deleted users/events (breaks GET /v1/events)
DELETE b FROM bookings b
LEFT JOIN users u ON u.id = b.user_id
LEFT JOIN events e ON e.id = b.event_id
WHERE u.id IS NULL OR e.id IS NULL;

-- -----------------------------------------------------------------------------
-- Verify
-- -----------------------------------------------------------------------------
SELECT id, name FROM roles ORDER BY id;
SELECT COUNT(*) AS approved_events FROM events WHERE status = 'APPROVED';
SELECT email, (SELECT name FROM roles r WHERE r.id = u.role_id) AS role FROM users u ORDER BY u.id;
