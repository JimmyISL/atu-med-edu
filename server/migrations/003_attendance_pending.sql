-- 003_attendance_pending.sql
-- Change attendance default from false (ABSENT) to NULL (PENDING)
-- 3-state: NULL=PENDING, true=PRESENT, false=ABSENT

ALTER TABLE meeting_attendees ALTER COLUMN attended SET DEFAULT NULL;

-- Convert existing unset records from ABSENT to PENDING
UPDATE meeting_attendees SET attended = NULL WHERE attended = false;
