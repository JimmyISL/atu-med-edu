-- 009_people_profile_fields.sql
-- Add extended profile fields to people table

ALTER TABLE people ADD COLUMN IF NOT EXISTS display_name VARCHAR(200);
ALTER TABLE people ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE people ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS organization VARCHAR(200);
ALTER TABLE people ADD COLUMN IF NOT EXISTS company VARCHAR(200);
ALTER TABLE people ADD COLUMN IF NOT EXISTS specialty VARCHAR(200);
ALTER TABLE people ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE people ADD COLUMN IF NOT EXISTS mailing_address TEXT;

CREATE INDEX IF NOT EXISTS idx_people_username ON people(username);
CREATE INDEX IF NOT EXISTS idx_people_specialty ON people(specialty);
CREATE INDEX IF NOT EXISTS idx_people_organization ON people(organization);
