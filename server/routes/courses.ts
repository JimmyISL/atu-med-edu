import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(String(status).toUpperCase());
    }
    if (search) {
      conditions.push(`(c.name ILIKE $${paramIndex} OR c.course_number ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM courses c ${where}`, params);
    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.*,
              CASE WHEN ch.title != '' THEN ch.title || ' ' || ch.first_name || ' ' || ch.last_name
                   ELSE ch.first_name || ' ' || ch.last_name END AS instructor
       FROM courses c
       LEFT JOIN people ch ON c.chair_id = ch.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, Number(limit), offset]
    );

    res.json({ data: result.rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('GET /api/courses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*,
              CASE WHEN ch.title != '' THEN ch.title || ' ' || ch.first_name || ' ' || ch.last_name
                   ELSE ch.first_name || ' ' || ch.last_name END AS chair_name,
              CASE WHEN m1.title != '' THEN m1.title || ' ' || m1.first_name || ' ' || m1.last_name
                   ELSE m1.first_name || ' ' || m1.last_name END AS moderator1_name,
              CASE WHEN m2.title != '' THEN m2.title || ' ' || m2.first_name || ' ' || m2.last_name
                   ELSE m2.first_name || ' ' || m2.last_name END AS moderator2_name,
              CASE WHEN org.title != '' THEN org.title || ' ' || org.first_name || ' ' || org.last_name
                   ELSE org.first_name || ' ' || org.last_name END AS organizer_name,
              CASE WHEN adm.title != '' THEN adm.title || ' ' || adm.first_name || ' ' || adm.last_name
                   ELSE adm.first_name || ' ' || adm.last_name END AS admin_name
       FROM courses c
       LEFT JOIN people ch ON c.chair_id = ch.id
       LEFT JOIN people m1 ON c.moderator1_id = m1.id
       LEFT JOIN people m2 ON c.moderator2_id = m2.id
       LEFT JOIN people org ON c.organizer_id = org.id
       LEFT JOIN people adm ON c.admin_id = adm.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get attendees
    const attendees = await pool.query(
      `SELECT ca.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS name,
              p.email, p.department
       FROM course_attendees ca JOIN people p ON ca.person_id = p.id
       WHERE ca.course_id = $1`,
      [id]
    );

    // Get related meetings
    const meetings = await pool.query(
      `SELECT id, title, meeting_date, start_time, end_time, location, status
       FROM meetings WHERE course_id = $1 ORDER BY meeting_date`,
      [id]
    );

    res.json({ ...result.rows[0], attendees: attendees.rows, meetings: meetings.rows });
  } catch (err) {
    console.error('GET /api/courses/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses
router.post('/', async (req, res) => {
  try {
    const {
      name, course_number, chair_id, cme_type, cme_total, value_total,
      course_type, duration, department, start_date, end_date,
      prerequisites, materials_required, notes, status,
      moderator1_id, moderator2_id, organizer_id, admin_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO courses (name, course_number, chair_id, cme_type, cme_total, value_total,
        course_type, duration, department, start_date, end_date, prerequisites, materials_required,
        notes, status, moderator1_id, moderator2_id, organizer_id, admin_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [name, course_number, chair_id, cme_type || 'Category 1', cme_total || 0, value_total || 0,
       course_type || 'Required', duration, department, start_date, end_date,
       prerequisites, materials_required, notes, status || 'DRAFT',
       moderator1_id, moderator2_id, organizer_id, admin_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A course with this number already exists' });
    }
    console.error('POST /api/courses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/courses/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const allowed = ['name', 'course_number', 'chair_id', 'cme_type', 'cme_total', 'value_total',
      'course_type', 'duration', 'department', 'start_date', 'end_date', 'prerequisites',
      'materials_required', 'notes', 'status', 'moderator1_id', 'moderator2_id', 'organizer_id', 'admin_id'];

    for (const key of allowed) {
      if (key in fields) {
        sets.push(`${key} = $${idx++}`);
        params.push(fields[key]);
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    sets.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE courses SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/courses/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses/:id/attendees - add attendee (with quick-add support)
router.post('/:id/attendees', async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id, role, quick_add } = req.body;

    let personId = person_id;

    // Quick-add: create a new person record with minimal info
    if (quick_add) {
      const { first_name, last_name, email } = req.body;
      if (!first_name || !last_name) {
        return res.status(400).json({ error: 'First name and last name are required for quick-add' });
      }
      const personResult = await pool.query(
        `INSERT INTO people (first_name, last_name, email, is_complete, status)
         VALUES ($1, $2, $3, false, 'ACTIVE') RETURNING id`,
        [first_name, last_name, email || null]
      );
      personId = personResult.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO course_attendees (course_id, person_id, role)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, personId, role || 'attendee']
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This person is already enrolled in this course' });
    }
    console.error('POST /api/courses/:id/attendees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/courses/:id/attendees/:personId
router.delete('/:id/attendees/:personId', async (req, res) => {
  try {
    const { id, personId } = req.params;
    await pool.query(
      'DELETE FROM course_attendees WHERE course_id = $1 AND person_id = $2',
      [id, personId]
    );
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE attendee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/courses/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
