-- Fix events pointing to deleted/missing organizer users (causes API 400 errors)
USE event;

-- Show broken rows first
SELECT e.id, e.title, e.organizer_id, e.status
FROM events e
LEFT JOIN users u ON u.id = e.organizer_id
WHERE u.id IS NULL;

-- Point orphan events to organizer@meu.edu.in (or first available user)
UPDATE events e
LEFT JOIN users u ON u.id = e.organizer_id
SET e.organizer_id = COALESCE(
    (SELECT id FROM users WHERE email = 'organizer@meu.edu.in' LIMIT 1),
    (SELECT id FROM users ORDER BY id LIMIT 1)
)
WHERE u.id IS NULL;

-- Fix missing college references if any
UPDATE events e
LEFT JOIN colleges c ON c.id = e.college_id
SET e.college_id = (SELECT id FROM colleges WHERE code = 'MU' LIMIT 1)
WHERE c.id IS NULL;

-- Remove bookings that reference deleted users or deleted events (breaks GET /v1/events)
DELETE b FROM bookings b
LEFT JOIN users u ON u.id = b.user_id
LEFT JOIN events e ON e.id = b.event_id
WHERE u.id IS NULL OR e.id IS NULL;

-- Ensure approved events are visible on frontend
-- UPDATE events SET status = 'APPROVED' WHERE status IN ('DRAFT', 'PENDING_APPROVAL');

SELECT COUNT(*) AS approved_events FROM events WHERE status = 'APPROVED';
