-- ATU MedEd Database Schema
-- 001_initial.sql

-- People (HR module)
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  title VARCHAR(10) DEFAULT 'Dr.',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Other',
  department VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  date_of_birth DATE,
  hire_date DATE,
  office_location VARCHAR(200),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  is_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  course_number VARCHAR(50) UNIQUE,
  chair_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  cme_type VARCHAR(50) DEFAULT 'Category 1',
  cme_total DECIMAL(8,2) DEFAULT 0,
  value_total DECIMAL(10,2) DEFAULT 0,
  course_type VARCHAR(50) DEFAULT 'Required',
  duration VARCHAR(100),
  department VARCHAR(100),
  start_date DATE,
  end_date DATE,
  prerequisites TEXT,
  materials_required TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  moderator1_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  moderator2_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  organizer_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  admin_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course Attendees
CREATE TABLE IF NOT EXISTS course_attendees (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'attendee',
  status VARCHAR(20) DEFAULT 'enrolled',
  completion_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, person_id)
);

-- Meetings
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  meeting_date DATE,
  start_time TIME,
  end_time TIME,
  location VARCHAR(200),
  subject VARCHAR(300),
  presenter_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  cme_credits DECIMAL(5,2) DEFAULT 0,
  expected_attendees INTEGER DEFAULT 0,
  description TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Attendees
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id, person_id)
);

-- CME Activities
CREATE TABLE IF NOT EXISTS cme_activities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  provider VARCHAR(200),
  activity_type VARCHAR(50) DEFAULT 'Category 1',
  credits DECIMAL(8,2) DEFAULT 0,
  value DECIMAL(10,2) DEFAULT 0,
  activity_date DATE,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CME Credits (person's earned credits per activity)
CREATE TABLE IF NOT EXISTS cme_credits (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  activity_id INTEGER NOT NULL REFERENCES cme_activities(id) ON DELETE CASCADE,
  credits_earned DECIMAL(8,2) NOT NULL DEFAULT 0,
  date_earned DATE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(person_id, activity_id)
);

-- Credential Templates
CREATE TABLE IF NOT EXISTS credential_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Active',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issued Credentials
CREATE TABLE IF NOT EXISTS issued_credentials (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES credential_templates(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  issue_date DATE,
  expiry_date DATE,
  credential_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_people_status ON people(status);
CREATE INDEX IF NOT EXISTS idx_people_role ON people(role);
CREATE INDEX IF NOT EXISTS idx_people_department ON people(department);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_cme_activities_status ON cme_activities(status);
CREATE INDEX IF NOT EXISTS idx_course_attendees_course ON course_attendees(course_id);
CREATE INDEX IF NOT EXISTS idx_course_attendees_person ON course_attendees(person_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_person ON meeting_attendees(person_id);
