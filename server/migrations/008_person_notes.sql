-- Person Notes / Threaded Comments
-- 008_person_notes.sql

CREATE TABLE IF NOT EXISTS person_notes (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES person_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_person_notes_person ON person_notes(person_id);
CREATE INDEX IF NOT EXISTS idx_person_notes_author ON person_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_person_notes_parent ON person_notes(parent_id);
