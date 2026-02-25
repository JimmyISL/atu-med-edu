import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/meetings
router.get('/', async (req, res) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Date-aware filtering based on status
    if (status === 'SCHEDULED') {
      // Upcoming: SCHEDULED status AND date is today or future
      conditions.push(`m.status = $${paramIndex++}`);
      params.push('SCHEDULED');
      conditions.push(`m.meeting_date >= CURRENT_DATE`);
    } else if (status === 'COMPLETED') {
      // Past: COMPLETED status OR date is in the past (regardless of status)
      conditions.push(`(m.status = 'COMPLETED' OR m.meeting_date < CURRENT_DATE)`);
    } else if (status === 'CANCELLED') {
      conditions.push(`m.status = $${paramIndex++}`);
      params.push('CANCELLED');
    }
    // For 'all' or no status, don't add status filter

    if (search) {
      conditions.push(`(m.title ILIKE $${paramIndex} OR m.location ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM meetings m ${where}`, params);
    const total = Number(countResult.rows[0].count);

    // Sort order: upcoming (SCHEDULED) sorts ASC, everything else sorts DESC
    const orderBy = status === 'SCHEDULED'
      ? 'ORDER BY m.meeting_date ASC, m.start_time ASC'
      : 'ORDER BY m.meeting_date DESC, m.start_time DESC';

    const result = await pool.query(
      `SELECT m.*,
              c.course_number as course,
              (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) as attendees,
              TO_CHAR(m.start_time, 'HH24:MI') || '-' || TO_CHAR(m.end_time, 'HH24:MI') as time
       FROM meetings m
       LEFT JOIN courses c ON m.course_id = c.id
       ${where}
       ${orderBy}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, Number(limit), offset]
    );

    res.json({ data: result.rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('GET /api/meetings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meetings/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT m.*,
              c.course_number as course, c.name as course_name, c.cme_type as course_cme_type,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS presenter_name
       FROM meetings m
       LEFT JOIN courses c ON m.course_id = c.id
       LEFT JOIN people p ON m.presenter_id = p.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Get attendees
    const attendees = await pool.query(
      `SELECT ma.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS name,
              p.email, p.department, p.role as person_role
       FROM meeting_attendees ma JOIN people p ON ma.person_id = p.id
       WHERE ma.meeting_id = $1`,
      [id]
    );

    res.json({ ...result.rows[0], attendees: attendees.rows });
  } catch (err) {
    console.error('GET /api/meetings/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings
router.post('/', async (req, res) => {
  try {
    const {
      title, course_id, meeting_date, start_time, end_time,
      location, subject, presenter_id, cme_credits,
      expected_attendees, description, notes, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO meetings (title, course_id, meeting_date, start_time, end_time,
        location, subject, presenter_id, cme_credits, expected_attendees, description, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [title, course_id, meeting_date, start_time, end_time,
       location, subject, presenter_id, cme_credits || 0,
       expected_attendees || 0, description, notes, status || 'SCHEDULED']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/meetings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/meetings/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const allowed = ['title', 'course_id', 'meeting_date', 'start_time', 'end_time',
      'location', 'subject', 'presenter_id', 'cme_credits', 'expected_attendees',
      'description', 'notes', 'status'];

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
      `UPDATE meetings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/meetings/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meetings/:id/attendees - add attendee (with quick-add support)
router.post('/:id/attendees', async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id, quick_add } = req.body;

    let personId = person_id;

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
      `INSERT INTO meeting_attendees (meeting_id, person_id)
       VALUES ($1, $2) RETURNING *`,
      [id, personId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This person is already in this meeting' });
    }
    console.error('POST /api/meetings/:id/attendees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/meetings/:id/attendees/:personId - toggle attendance
router.patch('/:id/attendees/:personId', async (req, res) => {
  try {
    const { id, personId } = req.params;
    const { attended } = req.body;
    await pool.query(
      'UPDATE meeting_attendees SET attended = $1 WHERE meeting_id = $2 AND person_id = $3',
      [attended, id, personId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH attendee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/meetings/:id/attendees/:personId
router.delete('/:id/attendees/:personId', async (req, res) => {
  try {
    const { id, personId } = req.params;
    await pool.query(
      'DELETE FROM meeting_attendees WHERE meeting_id = $1 AND person_id = $2',
      [id, personId]
    );
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE attendee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/meetings/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM meetings WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/meetings/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
