USE event_discovery_db;

-- Optional: create a dedicated seed organizer user if not present.
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  role_id,
  college_id,
  is_active,
  email_verified
)
SELECT
  'organizer@university-events.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Seed',
  'Organizer',
  (SELECT id FROM roles WHERE name = 'EVENT_ORGANIZER' LIMIT 1),
  (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1),
  TRUE,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'organizer@university-events.com'
);

-- Insert frontend events into backend.
-- Re-run safe: each event is inserted only if same title + date does not already exist.
INSERT INTO events (
  title, description, category_id, organizer_id, college_id,
  event_date, event_time, venue, mode, fee, seats_total, seats_left,
  deadline, status, is_featured, is_partner_event, image_url
)
SELECT
  d.title,
  d.description,
  (SELECT id FROM event_categories WHERE name = d.category_name LIMIT 1),
  (SELECT id FROM users WHERE email = 'organizer@university-events.com' LIMIT 1),
  (SELECT id FROM colleges WHERE name = d.college_name LIMIT 1),
  d.event_date,
  d.event_time,
  d.venue,
  d.mode,
  d.fee,
  d.seats_total,
  d.seats_left,
  d.deadline,
  'APPROVED',
  d.is_featured,
  d.is_partner_event,
  d.image_url
FROM (
  SELECT 'InnovateX 2026 — National Hackathon' AS title, 'A 36-hour national-level hackathon bringing together the brightest minds across India to solve real-world challenges in AI, sustainability, fintech and edtech.' AS description, 'Hackathon' AS category_name, 'Mandsaur University' AS college_name, '2026-06-12' AS event_date, '09:00:00' AS event_time, 'Engineering Block, Main Auditorium' AS venue, 'OFFLINE' AS mode, 0.00 AS fee, 500 AS seats_total, 142 AS seats_left, '2026-06-05' AS deadline, TRUE AS is_featured, FALSE AS is_partner_event, '/images/event-tech.jpg' AS image_url
  UNION ALL SELECT 'Sanskriti — Annual Cultural Fest', 'Three days of music, dance, drama and art celebrating India''s rich cultural heritage with performances from 40+ colleges.', 'Fest', 'Mandsaur University', '2026-05-22', '18:00:00', 'Open Air Theatre', 'OFFLINE', 199.00, 2000, 612, '2026-05-20', TRUE, FALSE, '/images/event-cultural.jpg'
  UNION ALL SELECT 'Inter-University Cricket Championship', '16 universities. One trophy. Cheer your team to victory at the most anticipated inter-university tournament of the year.', 'Sports', 'Mandsaur University', '2026-06-01', '08:00:00', 'MU Sports Ground', 'OFFLINE', 0.00, 800, 320, '2026-05-28', FALSE, FALSE, '/images/event-sports.jpg'
  UNION ALL SELECT 'AI & Future of Work — Industry Seminar', 'Industry leaders from Microsoft, Google and TCS discuss how AI is reshaping careers and what students must learn today to thrive tomorrow.', 'Seminar', 'IIT Indore', '2026-05-18', '11:00:00', 'Convention Hall', 'HYBRID', 0.00, 350, 89, '2026-05-17', TRUE, TRUE, '/images/event-seminar.jpg'
  UNION ALL SELECT 'Robotics Workshop — Build Your First Bot', 'Hands-on 2-day workshop where you''ll build, program and demo your own line-following robot. Kits included.', 'Workshop', 'Mandsaur University', '2026-05-30', '10:00:00', 'Robotics Lab, Block C', 'OFFLINE', 499.00, 60, 12, '2026-05-25', FALSE, FALSE, '/images/event-workshop.jpg'
  UNION ALL SELECT 'Mega Placement Drive — TCS, Infosys, Wipro', 'Final-year students, get ready! Three top recruiters on a single day with combined intake of 200+ offers.', 'Placement', 'Mandsaur University', '2026-06-08', '09:00:00', 'Training & Placement Cell', 'OFFLINE', 0.00, 1000, 421, '2026-06-05', FALSE, FALSE, '/images/event-placement.jpg'
  UNION ALL SELECT 'CodeStorm — Competitive Programming', '3-hour algorithmic battle. Top 10 win cash prizes and direct interview shortlists from sponsoring tech companies.', 'Competition', 'DAVV Indore', '2026-05-25', '14:00:00', 'CS Department Lab', 'ONLINE', 0.00, 200, 67, '2026-05-23', FALSE, TRUE, '/images/event-tech.jpg'
  UNION ALL SELECT 'Startup Pitch Day — Get Funded', 'Pitch your startup to a panel of VCs and angel investors. Selected ideas receive seed funding up to ₹10 lakh.', 'Technical', 'IIM Indore', '2026-06-15', '10:00:00', 'Innovation Centre', 'OFFLINE', 299.00, 150, 38, '2026-06-12', FALSE, TRUE, '/images/event-seminar.jpg'
) d
WHERE NOT EXISTS (
  SELECT 1
  FROM events e
  WHERE e.title = d.title
    AND e.event_date = d.event_date
);

-- Insert highlights for the seeded events.
INSERT INTO event_highlights (event_id, highlight_text, order_index)
SELECT e.id, h.highlight_text, h.order_index
FROM events e
JOIN (
  SELECT 'InnovateX 2026 — National Hackathon' AS title, 'Prize pool ₹5,00,000' AS highlight_text, 0 AS order_index
  UNION ALL SELECT 'InnovateX 2026 — National Hackathon', 'Mentorship from industry experts', 1
  UNION ALL SELECT 'InnovateX 2026 — National Hackathon', 'Free meals & accommodation', 2
  UNION ALL SELECT 'InnovateX 2026 — National Hackathon', 'Internship opportunities', 3
  UNION ALL SELECT 'Sanskriti — Annual Cultural Fest', 'Celebrity night', 0
  UNION ALL SELECT 'Sanskriti — Annual Cultural Fest', 'Inter-college competitions', 1
  UNION ALL SELECT 'Sanskriti — Annual Cultural Fest', 'Food festival', 2
  UNION ALL SELECT 'Sanskriti — Annual Cultural Fest', 'Art exhibitions', 3
  UNION ALL SELECT 'Inter-University Cricket Championship', '16 participating teams', 0
  UNION ALL SELECT 'Inter-University Cricket Championship', 'Live commentary', 1
  UNION ALL SELECT 'Inter-University Cricket Championship', 'Live streaming', 2
  UNION ALL SELECT 'AI & Future of Work — Industry Seminar', 'Networking lunch', 0
  UNION ALL SELECT 'AI & Future of Work — Industry Seminar', 'Q&A with leaders', 1
  UNION ALL SELECT 'AI & Future of Work — Industry Seminar', 'Certificate of participation', 2
  UNION ALL SELECT 'Robotics Workshop — Build Your First Bot', 'Take-home robot kit', 0
  UNION ALL SELECT 'Robotics Workshop — Build Your First Bot', 'Expert mentors', 1
  UNION ALL SELECT 'Robotics Workshop — Build Your First Bot', 'Certification', 2
  UNION ALL SELECT 'Mega Placement Drive — TCS, Infosys, Wipro', '3 companies', 0
  UNION ALL SELECT 'Mega Placement Drive — TCS, Infosys, Wipro', 'On-spot offers', 1
  UNION ALL SELECT 'Mega Placement Drive — TCS, Infosys, Wipro', 'Mock interview prep included', 2
  UNION ALL SELECT 'CodeStorm — Competitive Programming', 'Cash prizes ₹50,000', 0
  UNION ALL SELECT 'CodeStorm — Competitive Programming', 'Sponsored by tech firms', 1
  UNION ALL SELECT 'CodeStorm — Competitive Programming', 'All India ranking', 2
  UNION ALL SELECT 'Startup Pitch Day — Get Funded', 'VC panel', 0
  UNION ALL SELECT 'Startup Pitch Day — Get Funded', 'Seed funding opportunity', 1
  UNION ALL SELECT 'Startup Pitch Day — Get Funded', 'Media coverage', 2
) h ON h.title = e.title
WHERE NOT EXISTS (
  SELECT 1
  FROM event_highlights eh
  WHERE eh.event_id = e.id
    AND eh.highlight_text = h.highlight_text
);

-- Rolling demo events (dates relative to CURDATE() so they stay upcoming after re-import)
INSERT INTO events (
  title, description, category_id, organizer_id, college_id,
  event_date, event_time, venue, mode, fee, seats_total, seats_left,
  deadline, status, is_featured, is_partner_event, image_url
)
SELECT
  d.title,
  d.description,
  (SELECT id FROM event_categories WHERE name = d.category_name LIMIT 1),
  (SELECT id FROM users WHERE email = 'organizer@university-events.com' LIMIT 1),
  (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1),
  d.event_date,
  d.event_time,
  d.venue,
  d.mode,
  d.fee,
  d.seats_total,
  d.seats_left,
  d.deadline,
  'APPROVED',
  d.is_featured,
  FALSE,
  d.image_url
FROM (
  SELECT
    'Demo: Weekly Coding Challenge' AS title,
    'Practice contest open to all MU students. Leaderboard resets weekly.' AS description,
    'Technical' AS category_name,
    DATE_ADD(CURDATE(), INTERVAL 7 DAY) AS event_date,
    '15:00:00' AS event_time,
    'Online — MU LMS' AS venue,
    'ONLINE' AS mode,
    0.00 AS fee,
    300 AS seats_total,
    300 AS seats_left,
    DATE_ADD(CURDATE(), INTERVAL 5 DAY) AS deadline,
    TRUE AS is_featured,
    '/images/event-tech.jpg' AS image_url
  UNION ALL SELECT
    'Demo: Entrepreneurship Bootcamp Weekend',
    'Two-day intensive bootcamp covering idea validation, pitching and fundraising basics.',
    'Workshop',
    DATE_ADD(CURDATE(), INTERVAL 21 DAY),
    '10:00:00',
    'Innovation Lab, Block A',
    'OFFLINE',
    99.00,
    80,
    80,
    DATE_ADD(CURDATE(), INTERVAL 14 DAY),
    FALSE,
    '/images/event-workshop.jpg'
  UNION ALL SELECT
    'Demo: Inter-College Basketball Finals',
    'Knockout finals featuring top teams from partner institutions.',
    'Sports',
    DATE_ADD(CURDATE(), INTERVAL 35 DAY),
    '17:00:00',
    'MU Indoor Stadium',
    'OFFLINE',
    0.00,
    1200,
    900,
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    TRUE,
    '/images/event-sports.jpg'
) d
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.title = d.title
);

INSERT INTO event_highlights (event_id, highlight_text, order_index)
SELECT e.id, h.highlight_text, h.order_index
FROM events e
JOIN (
  SELECT 'Demo: Weekly Coding Challenge' AS title, 'Weekly leaderboard' AS highlight_text, 0 AS order_index
  UNION ALL SELECT 'Demo: Weekly Coding Challenge', 'Certificates for top 50', 1
  UNION ALL SELECT 'Demo: Entrepreneurship Bootcamp Weekend', 'Mentor sessions', 0
  UNION ALL SELECT 'Demo: Entrepreneurship Bootcamp Weekend', 'Pitch dry-run', 1
  UNION ALL SELECT 'Demo: Inter-College Basketball Finals', 'Live streaming', 0
  UNION ALL SELECT 'Demo: Inter-College Basketball Finals', 'Food stalls', 1
) h ON h.title = e.title
WHERE NOT EXISTS (
  SELECT 1 FROM event_highlights eh WHERE eh.event_id = e.id AND eh.highlight_text = h.highlight_text
);
