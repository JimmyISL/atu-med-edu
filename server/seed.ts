import pool from './db.js';

async function seed() {
  const client = await pool.connect();
  try {
    // Check if already seeded
    const { rows } = await client.query('SELECT COUNT(*) FROM people');
    if (Number(rows[0].count) > 0) {
      console.log('  Database already has data, skipping seed.');
      return;
    }

    console.log('  Seeding people...');
    await client.query(`
      INSERT INTO people (title, first_name, last_name, role, department, email, phone, hire_date, office_location, status, is_complete) VALUES
      ('Dr.', 'James', 'Wilson', 'Faculty', 'Cardiology', 'j.wilson@univ.edu', '555-0101', '2018-08-15', 'Building A, Room 301', 'ACTIVE', true),
      ('Dr.', 'Lisa', 'Kim', 'Faculty', 'Neurology', 'l.kim@univ.edu', '555-0102', '2019-03-01', 'Building B, Room 210', 'ACTIVE', true),
      ('Dr.', 'Ray', 'Patel', 'Resident', 'Surgery', 'r.patel@univ.edu', '555-0103', '2022-07-01', 'Building C, Room 105', 'OFFSITE', true),
      ('', 'Maria', 'Santos', 'Staff', 'Administration', 'm.santos@univ.edu', '555-0104', '2020-01-10', 'Admin Office 2', 'LEAVE', true),
      ('Dr.', 'Chen', 'Wei', 'Faculty', 'Pharmacology', 'c.wei@univ.edu', '555-0105', '2017-09-01', 'Building D, Room 402', 'ACTIVE', true),
      ('', 'Anna', 'Kowalski', 'Resident', 'Radiology', 'a.kowalski@univ.edu', '555-0106', '2023-07-01', 'Building B, Room 115', 'INACTIVE', true),
      ('Dr.', 'Sarah', 'Mitchell', 'Faculty', 'Emergency Medicine', 's.mitchell@univ.edu', '555-0107', '2016-06-15', 'ER Wing, Office 3', 'ACTIVE', true),
      ('Dr.', 'Michael', 'Thompson', 'Faculty', 'Internal Medicine', 'm.thompson@univ.edu', '555-0108', '2015-01-20', 'Building A, Room 405', 'ACTIVE', true),
      ('Dr.', 'Emily', 'Rodriguez', 'Faculty', 'Pediatrics', 'e.rodriguez@univ.edu', '555-0109', '2020-08-01', 'Building E, Room 201', 'ACTIVE', true),
      ('Dr.', 'Amanda', 'Foster', 'Faculty', 'Oncology', 'a.foster@univ.edu', '555-0110', '2019-11-01', 'Building F, Room 310', 'ACTIVE', true),
      ('', 'John', 'Smith', 'Staff', 'Administration', 'j.smith@univ.edu', '555-0111', '2021-03-15', 'Admin Office 5', 'ACTIVE', true),
      ('Dr.', 'Robert', 'Chang', 'Resident', 'Cardiology', 'r.chang@univ.edu', '555-0112', '2023-07-01', 'Building A, Room 102', 'ACTIVE', true),
      ('Dr.', 'Priya', 'Sharma', 'Faculty', 'Neurology', 'p.sharma@univ.edu', '555-0113', '2018-02-01', 'Building B, Room 305', 'ACTIVE', true),
      ('', 'David', 'Martinez', 'Staff', 'IT', 'j.martinez@univ.edu', '555-0114', '2022-05-01', 'IT Building, Room 101', 'ACTIVE', true),
      ('Dr.', 'Karen', 'Johnson', 'Faculty', 'Surgery', 'k.johnson@univ.edu', '555-0115', '2014-09-01', 'Building C, Room 401', 'ACTIVE', true)
    `);

    console.log('  Seeding courses...');
    await client.query(`
      INSERT INTO courses (name, course_number, chair_id, cme_type, cme_total, value_total, course_type, duration, department, start_date, end_date, status, moderator1_id, moderator2_id, organizer_id, admin_id) VALUES
      ('Advanced Cardiac Life Support', 'CRS-1001', 7, 'Category 1', 24.0, 4800, 'Required', '2 weeks', 'Cardiology', '2025-01-15', '2025-06-30', 'ACTIVE', 1, 8, 4, 11),
      ('Internal Medicine Board Review', 'CRS-1002', 8, 'Category 1', 32.0, 6400, 'Required', '4 weeks', 'Internal Medicine', '2025-02-01', '2025-07-31', 'ACTIVE', 2, 13, 11, 4),
      ('Pharmacology Fundamentals', 'CRS-1003', 5, 'Category 2', 16.0, 3200, 'Elective', '3 weeks', 'Pharmacology', '2025-03-01', '2025-05-30', 'DRAFT', 5, 10, 4, 11),
      ('Ethics in Medical Practice', 'CRS-1004', 2, 'Category 1', 8.0, 1600, 'Required', '1 week', 'Neurology', '2025-02-10', '2025-04-10', 'ACTIVE', 9, 2, 11, 4),
      ('Surgical Techniques Workshop', 'CRS-1005', 15, 'Category 1', 20.0, 4000, 'Elective', '2 weeks', 'Surgery', '2024-09-01', '2024-12-15', 'ARCHIVED', 3, 15, 4, 11),
      ('Emergency Medicine Update', 'CRS-1006', 7, 'Category 2', 12.0, 2400, 'Optional', '1 week', 'Emergency Medicine', '2025-04-01', '2025-06-30', 'ACTIVE', 7, 10, 11, 4)
    `);

    console.log('  Seeding meetings...');
    await client.query(`
      INSERT INTO meetings (title, course_id, meeting_date, start_time, end_time, location, subject, presenter_id, cme_credits, expected_attendees, status) VALUES
      ('Anatomy Lab Review', 1, '2025-01-12', '09:00', '10:30', 'Room 301A', 'ACLS anatomy review session', 7, 1.5, 24, 'COMPLETED'),
      ('Cardiology Seminar', 2, '2025-03-04', '14:00', '16:00', 'Aud. B', 'Advanced cardiac imaging techniques', 1, 2.0, 45, 'SCHEDULED'),
      ('Pharmacology Workshop', 3, '2025-02-26', '10:00', '12:00', 'Lab 204', 'Drug interaction case studies', 5, 2.0, 18, 'COMPLETED'),
      ('Ethics Board Meeting', 4, '2025-03-05', '13:00', '14:30', 'Conf. Rm 1', 'Medical ethics quarterly review', 2, 1.5, 12, 'SCHEDULED'),
      ('Surgical Skills Demo', 5, '2025-02-20', '08:00', '12:00', 'Sim Center', 'Laparoscopic techniques demonstration', 15, 4.0, 30, 'COMPLETED'),
      ('Grand Rounds: Neurology', 2, '2025-03-10', '12:00', '13:00', 'Main Hall', 'Advances in stroke treatment', 13, 1.0, 80, 'SCHEDULED'),
      ('Resident Case Review', 6, '2025-03-08', '16:00', '17:00', 'Room 105', 'Emergency case presentations', 7, 1.0, 15, 'CANCELLED')
    `);

    console.log('  Seeding meeting attendees...');
    await client.query(`
      INSERT INTO meeting_attendees (meeting_id, person_id, attended) VALUES
      (1, 1, true), (1, 3, true), (1, 7, true), (1, 12, true),
      (2, 1, false), (2, 2, false), (2, 8, false), (2, 12, false),
      (3, 5, true), (3, 3, true), (3, 6, true),
      (4, 2, false), (4, 9, false), (4, 10, false),
      (5, 3, true), (5, 15, true), (5, 12, true),
      (6, 2, false), (6, 13, false), (6, 8, false)
    `);

    console.log('  Seeding course attendees...');
    await client.query(`
      INSERT INTO course_attendees (course_id, person_id, role, status) VALUES
      (1, 3, 'attendee', 'enrolled'), (1, 12, 'attendee', 'enrolled'), (1, 6, 'attendee', 'enrolled'),
      (2, 1, 'instructor', 'enrolled'), (2, 3, 'attendee', 'enrolled'), (2, 12, 'attendee', 'enrolled'),
      (3, 3, 'attendee', 'enrolled'), (3, 6, 'attendee', 'enrolled'),
      (4, 9, 'instructor', 'enrolled'), (4, 3, 'attendee', 'enrolled'),
      (5, 3, 'attendee', 'completed'), (5, 12, 'attendee', 'completed'),
      (6, 7, 'instructor', 'enrolled'), (6, 3, 'attendee', 'enrolled')
    `);

    console.log('  Seeding CME activities...');
    await client.query(`
      INSERT INTO cme_activities (name, provider, activity_type, credits, value, activity_date, status) VALUES
      ('Annual Cardiology Conference', 'AMA', 'Category 1', 24.0, 4800, '2025-03-15', 'APPROVED'),
      ('Advanced Surgical Techniques Workshop', 'ACCME', 'Category 1', 16.0, 3200, '2025-03-10', 'PENDING'),
      ('Clinical Research Methodology', 'NIH', 'Category 2', 12.0, 2400, '2025-03-05', 'APPROVED'),
      ('Patient Safety & Quality Improvement', 'Joint Commission', 'Category 1', 8.0, 1600, '2025-02-28', 'REJECTED'),
      ('Medical Ethics Seminar', 'AMA', 'Category 2', 6.0, 1200, '2025-02-20', 'APPROVED'),
      ('Emergency Medicine Update', 'ACEP', 'Category 1', 20.0, 4000, '2025-02-15', 'PENDING')
    `);

    console.log('  Seeding CME credits...');
    await client.query(`
      INSERT INTO cme_credits (person_id, activity_id, credits_earned, date_earned, verified) VALUES
      (7, 1, 24.0, '2025-03-15', true),
      (1, 1, 24.0, '2025-03-15', true),
      (15, 2, 16.0, '2025-03-10', false),
      (8, 3, 12.0, '2025-03-05', true),
      (2, 5, 6.0, '2025-02-20', true),
      (7, 6, 20.0, '2025-02-15', false)
    `);

    console.log('  Seeding credential templates...');
    await client.query(`
      INSERT INTO credential_templates (name, category, status) VALUES
      ('Certificate of Completion - Category 1', 'Category 1', 'Active'),
      ('Certificate of Completion - Category 2', 'Category 2', 'Active'),
      ('Advanced Training Certificate', 'Category 1', 'Active'),
      ('Professional Development Certificate', 'Category 2', 'Active')
    `);

    console.log('  Seeding issued credentials...');
    await client.query(`
      INSERT INTO issued_credentials (template_id, person_id, issue_date, expiry_date, credential_number, status) VALUES
      (1, 7, '2025-03-15', '2027-03-15', 'CERT-2025-001', 'ACTIVE'),
      (1, 1, '2025-03-15', '2027-03-15', 'CERT-2025-002', 'ACTIVE'),
      (3, 15, '2025-03-10', '2027-03-10', 'CERT-2025-003', 'ACTIVE'),
      (2, 8, '2025-03-05', '2027-03-05', 'CERT-2025-004', 'ACTIVE'),
      (4, 2, '2025-02-20', '2027-02-20', 'CERT-2025-005', 'ACTIVE'),
      (1, 5, '2024-06-15', '2025-01-15', 'CERT-2024-010', 'EXPIRED')
    `);

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
  }
}

export default seed;

if (process.argv[1] && process.argv[1].includes('seed')) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}
