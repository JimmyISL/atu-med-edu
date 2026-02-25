-- Training Paths feature
-- 007_training_paths.sql

-- Training Paths (top-level entity)
CREATE TABLE IF NOT EXISTS training_paths (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES people(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Path Steps (courses within a path, grouped by phase)
CREATE TABLE IF NOT EXISTS path_steps (
  id SERIAL PRIMARY KEY,
  path_id INTEGER NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  step_group INTEGER NOT NULL DEFAULT 1,
  step_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trainee enrollment on a path
CREATE TABLE IF NOT EXISTS trainee_paths (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  path_id INTEGER NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  UNIQUE(person_id, path_id)
);

-- Per-step progress for each trainee
CREATE TABLE IF NOT EXISTS trainee_step_progress (
  id SERIAL PRIMARY KEY,
  trainee_path_id INTEGER NOT NULL REFERENCES trainee_paths(id) ON DELETE CASCADE,
  path_step_id INTEGER NOT NULL REFERENCES path_steps(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(trainee_path_id, path_step_id)
);

-- Action items tied to a path step
CREATE TABLE IF NOT EXISTS action_items (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  path_step_id INTEGER REFERENCES path_steps(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  due_date DATE,
  assigned_by INTEGER REFERENCES people(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_paths_status ON training_paths(status);
CREATE INDEX IF NOT EXISTS idx_training_paths_created_by ON training_paths(created_by);
CREATE INDEX IF NOT EXISTS idx_path_steps_path ON path_steps(path_id);
CREATE INDEX IF NOT EXISTS idx_path_steps_course ON path_steps(course_id);
CREATE INDEX IF NOT EXISTS idx_trainee_paths_person ON trainee_paths(person_id);
CREATE INDEX IF NOT EXISTS idx_trainee_paths_path ON trainee_paths(path_id);
CREATE INDEX IF NOT EXISTS idx_trainee_paths_status ON trainee_paths(status);
CREATE INDEX IF NOT EXISTS idx_trainee_step_progress_trainee ON trainee_step_progress(trainee_path_id);
CREATE INDEX IF NOT EXISTS idx_trainee_step_progress_step ON trainee_step_progress(path_step_id);
CREATE INDEX IF NOT EXISTS idx_action_items_person ON action_items(person_id);
CREATE INDEX IF NOT EXISTS idx_action_items_step ON action_items(path_step_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
