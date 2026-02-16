-- 004_replace_courses.sql
-- Replace all courses with real ATU course catalog
-- Chair people: Abbasi Hamid Reza, Moore Dominic, Zhan Jimmy, Armagost Amanda

-- ── Step 1: Ensure chair people exist ──
INSERT INTO people (first_name, last_name, role, department, is_complete)
SELECT 'Hamid Reza', 'Abbasi', 'Faculty', 'Surgery', true
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi');

INSERT INTO people (first_name, last_name, role, department, is_complete)
SELECT 'Dominic', 'Moore', 'Faculty', 'Research', true
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Dominic' AND last_name = 'Moore');

INSERT INTO people (first_name, last_name, role, department, is_complete)
SELECT 'Jimmy', 'Zhan', 'Staff', 'IT', true
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Jimmy' AND last_name = 'Zhan');

INSERT INTO people (first_name, last_name, role, department, is_complete)
SELECT 'Amanda', 'Armagost', 'Staff', 'Administration', true
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Amanda' AND last_name = 'Armagost');

-- ── Step 2: Delete all existing courses ──
-- course_attendees will CASCADE delete, meetings.course_id will SET NULL
DELETE FROM courses;

-- Reset the sequence so new IDs start fresh
SELECT setval('courses_id_seq', 1, false);

-- ── Step 3: Insert all ATU courses ──
INSERT INTO courses (course_number, name, chair_id, status) VALUES
('1',  'Surgical Skills -OLLIF cadaver lab 1',                              (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('2',  'Surgical Skills -OLLIF cadaver lab 2',                              (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('3',  'Surgical Skills -Posterolateral instrumentation and percutaneous',  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('4',  'Surgical Skills -Sacro iliac fusion',                               (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('5',  'MIS scoliosis correction with pelvic instrumentation',              (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('6',  'Surgical Skills -Trans facet OLLIF',                                (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('7',  'Surgical Skills -Prone direct lateral fusion and instrumentation',  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('8',  'Anatomy of thoracic structure',                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('9',  'Medical Skills-Nature of pain',                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('10', 'Medical Skills-Musculoskeletal pain management',                    (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('12', 'Anatomy 1- Nomenclature',                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('13', 'Anatomy 2- the basics',                                            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('14', 'Anatomy 3- skeletal system',                                       (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('15', 'Anatomy 4- spine',                                                 (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('16', 'Anatomy 5- skull',                                                 (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('17', 'Anatomy 6-heart',                                                  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('18', 'Anatomy 7-brain',                                                  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('19', 'Radiology 1- basics',                                              (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('20', 'Radiology 2- xray, c arm',                                         (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('21', 'Radiology 3- CT basics',                                           (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('22', 'Radiology 4-CT advanced',                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('23', 'Radiology 5- MRI basics',                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('24', 'Radiology 6- MRI advanced',                                        (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('25', 'Medical Skills- Wound -drain Management',                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('26', 'Medical Skills-suturing skills',                                    (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('27', 'Medical Skills-ortosis/bracing',                                    (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('28', 'ISL-Interview',                                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('29', 'ISL-Tour',                                                          (SELECT id FROM people WHERE first_name = 'Amanda' AND last_name = 'Armagost' LIMIT 1), 'ACTIVE'),
('30', 'ISL-Business Meeting',                                              (SELECT id FROM people WHERE first_name = 'Amanda' AND last_name = 'Armagost' LIMIT 1), 'ACTIVE'),
('31', 'ATU-Case Conference - Inspired Spine Case Review',                  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('33', 'Surgical Skills -OLLIF Model lab',                                  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('34', 'Clinical Skills - Clinical Communication',                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('35', 'Medical Skills- Basic 1',                                           (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('36', 'Medical Skills- Basic 2',                                           (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('37', 'Medical Skills- Rules of sterility',                                (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('38', 'Medical Skills- Patient expectation Management',                    (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('39', 'ISSC-Advanced Proctoring',                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('40', 'ATU-Research - Neuropro Basic',                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('41', 'ATU-Research - Neuropro data collection',                           (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('42', 'ISL-Marketting-Telemedia',                                          NULL, 'ACTIVE'),
('45', 'ATU-External-presentation in societies',                            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('46', 'External-Media',                                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('47', 'ATU-Case Conference - Surgeon -Inspired Spine',                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('48', 'ATU-Case Conference - PT-OT-Chiro-nurses',                         (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('49', 'ATU-Case Conference - External- Personal presentation',            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('50', 'ATU-Case Conference - Personal presentation- Non surgical',        (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('51', 'Computer Skills - Tutorials',                                       (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('52', 'Surgical Skills - Observation (No Lab)',                            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('53', 'Surgical Skills -Soft transition surgical proctorship',             (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('54', 'Surgical Skills -OLLIF Porcine lab',                                (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('55', 'Surgical Skills - Clinical fellowship',                             (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('56', 'ATU-Research - paper official paper review',                        (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('57', 'Computer Skills - 101- basic skills',                               (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('58', 'Computer Skills - 101- Network',                                    (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('59', 'Computer Skills - 101- Router',                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('60', 'Computer Skills - 101- Advanced Skills',                            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('61', 'Computer Skills - MS Access',                                       (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('62', 'ISL-Life Skills- Life Coach',                                       (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('63', 'ATU-Inspired Spine Symposium',                                      (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('64', 'ISL-Podcast',                                                       (SELECT id FROM people WHERE first_name = 'Amanda' AND last_name = 'Armagost' LIMIT 1), 'ACTIVE'),
('65', 'Aesthetics - course',                                               (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('66', 'Aesthetics - Lab',                                                  (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('67', 'Clinical Skills_Scribe Flow Basics',                                (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('68', 'Medical Skills - Clinical image review',                            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('69', 'Clinical Skills - Pain Management Medical',                         (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('70', 'Clinical Skills - Pain Management Procedural',                      (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('71', 'Computer Skills - Animation - content creation',                    (SELECT id FROM people WHERE first_name = 'Amanda' AND last_name = 'Armagost' LIMIT 1), 'ACTIVE'),
('72', 'Surgical Skills -Intra operative Neuro Monitoring IONM',            (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('73', 'External-Conference CME''s',                                        (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('74', 'ATU-State License CME''s',                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('75', 'ATU-Research Meeting',                                              (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('76', 'Legal-Fairview',                                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('77', 'Legal-ATU',                                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('78', 'Legal-ARM',                                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('79', 'Surgical Skills -External',                                          (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('80', 'ATU-Avicenna Society',                                               (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('81', 'ATU-Internship',                                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('82', 'Clinical Skills - Fitting Braces',                                   (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('83', 'Computer Skills - AI Application',                                   (SELECT id FROM people WHERE first_name = 'Jimmy' AND last_name = 'Zhan' LIMIT 1), 'ACTIVE'),
('84', 'ATU-Research Meeting',                                               (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('85', 'Surgical Skills - Intro US Group',                                   (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('86', 'Surgical Skills - Intro US Surgeon',                                 (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('87', 'Surgical Skills - Intro Non US',                                     (SELECT id FROM people WHERE first_name = 'Hamid Reza' AND last_name = 'Abbasi' LIMIT 1), 'ACTIVE'),
('88', 'ATU research',                                                       (SELECT id FROM people WHERE first_name = 'Dominic' AND last_name = 'Moore' LIMIT 1), 'ACTIVE');
