USE event_discovery_db;

-- Seed testimonials for homepage.
INSERT INTO testimonials (full_name, role, quote, is_featured, display_order)
SELECT * FROM (
  SELECT 'Priya Sharma' AS full_name, 'B.Tech CSE, 3rd Year' AS role, 'I discovered the IIT Indore hackathon through this portal and ended up winning runner-up. The platform changed my college experience.' AS quote, TRUE AS is_featured, 1 AS display_order
  UNION ALL
  SELECT 'Aarav Patel', 'MBA, 2nd Year', 'The collaboration discounts saved me thousands. I attended 8 inter-college events last semester alone.', TRUE, 2
  UNION ALL
  SELECT 'Dr. Meera Joshi', 'Faculty Coordinator', 'Managing registrations and approvals has never been easier. The admin dashboard is a game-changer for organizers.', TRUE, 3
) t
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials x WHERE x.full_name = t.full_name AND x.quote = t.quote
);

-- Seed approved collaboration offers.
INSERT INTO collaborations (requester_college_id, partner_college_id, status, request_date, response_date, special_offers, notes, updated_at)
SELECT * FROM (
  SELECT
    (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1) AS requester_college_id,
    (SELECT id FROM colleges WHERE code = 'IITI' LIMIT 1) AS partner_college_id,
    'APPROVED' AS status,
    NOW() AS request_date,
    NOW() AS response_date,
    '30% discount on all paid events for MU students' AS special_offers,
    'Seeded partnership offer' AS notes,
    NOW() AS updated_at
  UNION ALL
  SELECT
    (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1),
    (SELECT id FROM colleges WHERE code = 'DAVV' LIMIT 1),
    'APPROVED',
    NOW(),
    NOW(),
    '50 reserved seats for every collaborative fest',
    'Seeded partnership offer',
    NOW()
  UNION ALL
  SELECT
    (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1),
    (SELECT id FROM colleges WHERE code = 'IIMI' LIMIT 1),
    'APPROVED',
    NOW(),
    NOW(),
    'Free access to leadership seminars (worth INR 2,000)',
    'Seeded partnership offer',
    NOW()
) c
WHERE NOT EXISTS (
  SELECT 1
  FROM collaborations x
  WHERE x.requester_college_id = c.requester_college_id
    AND x.partner_college_id = c.partner_college_id
    AND x.special_offers = c.special_offers
);

-- Seed gallery images.
INSERT INTO gallery_images (title, description, event_id, image_url, event_date, category, is_featured, created_at, updated_at)
SELECT * FROM (
  SELECT 'Hackathon Finale 2026' AS title, 'Winners presenting final prototypes at InnovateX.' AS description, (SELECT id FROM events WHERE title LIKE 'InnovateX 2026%' LIMIT 1) AS event_id, '/images/gallery/hackathon-finale.jpg' AS image_url, '2026-06-13' AS event_date, 'Hackathon' AS category, TRUE AS is_featured, NOW() AS created_at, NOW() AS updated_at
  UNION ALL
  SELECT 'Sanskriti Cultural Night', 'Packed audience during the annual cultural fest.', (SELECT id FROM events WHERE title LIKE 'Sanskriti%' LIMIT 1), '/images/gallery/sanskriti-night.jpg', '2026-05-22', 'Cultural', TRUE, NOW(), NOW()
  UNION ALL
  SELECT 'Cricket Championship Finals', 'Inter-university final at MU Sports Ground.', (SELECT id FROM events WHERE title LIKE 'Inter-University Cricket%' LIMIT 1), '/images/gallery/cricket-finals.jpg', '2026-06-01', 'Sports', FALSE, NOW(), NOW()
  UNION ALL
  SELECT 'Robotics Workshop Demo', 'Students testing line-following bots during workshop.', (SELECT id FROM events WHERE title LIKE 'Robotics Workshop%' LIMIT 1), '/images/gallery/robotics-demo.jpg', '2026-05-30', 'Workshop', FALSE, NOW(), NOW()
  UNION ALL
  SELECT 'Industry Seminar Q&A', 'Interactive Q&A with industry leaders on AI careers.', (SELECT id FROM events WHERE title LIKE 'AI & Future of Work%' LIMIT 1), '/images/gallery/seminar-qa.jpg', '2026-05-18', 'Seminar', TRUE, NOW(), NOW()
) g
WHERE NOT EXISTS (
  SELECT 1 FROM gallery_images x WHERE x.title = g.title AND x.image_url = g.image_url
);
