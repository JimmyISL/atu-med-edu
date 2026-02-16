import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/people - list all people with optional filters
router.get('/', async (req, res) => {
  try {
    const { role, status, search, page = '1', limit = '50' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (role && role !== 'all') {
      conditions.push(`role = $${paramIndex++}`);
      params.push(String(role));
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(String(status));
    }
    if (search) {
      conditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM people ${where}`,
      params
    );
    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, title, first_name, last_name, role, department, email, phone, status, is_complete,
              TRIM(COALESCE(title, '') || ' ' || first_name || ' ' || last_name) AS name
       FROM people ${where}
       ORDER BY last_name, first_name
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, Number(limit), offset]
    );

    // Get counts by role
    const countsResult = await pool.query(`
      SELECT role, COUNT(*) as count FROM people GROUP BY role
      UNION ALL
      SELECT 'all', COUNT(*) FROM people
    `);
    const counts: Record<string, number> = {};
    for (const row of countsResult.rows) {
      counts[row.role.toLowerCase()] = Number(row.count);
    }

    res.json({ data: result.rows, total, counts, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('GET /api/people error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/people/all - simple list for dropdowns (id, name)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, first_name, last_name,
              CASE WHEN title != '' THEN title || ' ' || first_name || ' ' || last_name
                   ELSE first_name || ' ' || last_name END AS name,
              role, department
       FROM people WHERE status != 'INACTIVE'
       ORDER BY last_name, first_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/people/all error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/people/:id - get single person
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT *, TRIM(COALESCE(title, '') || ' ' || first_name || ' ' || last_name) AS name FROM people WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Get their course enrollments
    const courses = await pool.query(
      `SELECT ca.*, c.name as course_name, c.course_number
       FROM course_attendees ca JOIN courses c ON ca.course_id = c.id
       WHERE ca.person_id = $1`,
      [id]
    );

    // Get their meeting attendance
    const meetings = await pool.query(
      `SELECT ma.*, m.title as meeting_title, m.meeting_date
       FROM meeting_attendees ma JOIN meetings m ON ma.meeting_id = m.id
       WHERE ma.person_id = $1`,
      [id]
    );

    // Get their CME credits
    const cmeCredits = await pool.query(
      `SELECT cc.*, ca.name as activity_name
       FROM cme_credits cc JOIN cme_activities ca ON cc.activity_id = ca.id
       WHERE cc.person_id = $1`,
      [id]
    );

    // Get their credentials
    const credentials = await pool.query(
      `SELECT ic.*, ct.name as template_name
       FROM issued_credentials ic JOIN credential_templates ct ON ic.template_id = ct.id
       WHERE ic.person_id = $1`,
      [id]
    );

    res.json({
      ...result.rows[0],
      courses: courses.rows,
      meetings: meetings.rows,
      cme_credits: cmeCredits.rows,
      credentials: credentials.rows,
    });
  } catch (err) {
    console.error('GET /api/people/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/people - create person
router.post('/', async (req, res) => {
  try {
    const { title, first_name, last_name, role, department, email, phone, date_of_birth, hire_date, office_location, notes, status, is_complete } = req.body;

    const result = await pool.query(
      `INSERT INTO people (title, first_name, last_name, role, department, email, phone, date_of_birth, hire_date, office_location, notes, status, is_complete)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title || '', first_name, last_name, role || 'Other', department, email, phone, date_of_birth, hire_date, office_location, notes, status || 'ACTIVE', is_complete !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A person with this email already exists' });
    }
    console.error('POST /api/people error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/people/quick-add - quick-add undocumented person (minimal info)
router.post('/quick-add', async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const result = await pool.query(
      `INSERT INTO people (first_name, last_name, email, is_complete, status)
       VALUES ($1, $2, $3, false, 'ACTIVE')
       RETURNING *`,
      [first_name, last_name, email || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A person with this email already exists' });
    }
    console.error('POST /api/people/quick-add error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/people/:id - update person
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, first_name, last_name, role, department, email, phone, date_of_birth, hire_date, office_location, notes, status, is_complete } = req.body;

    const result = await pool.query(
      `UPDATE people SET
        title = COALESCE($1, title),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        role = COALESCE($4, role),
        department = COALESCE($5, department),
        email = COALESCE($6, email),
        phone = COALESCE($7, phone),
        date_of_birth = COALESCE($8, date_of_birth),
        hire_date = COALESCE($9, hire_date),
        office_location = COALESCE($10, office_location),
        notes = COALESCE($11, notes),
        status = COALESCE($12, status),
        is_complete = COALESCE($13, is_complete),
        updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [title, first_name, last_name, role, department, email, phone, date_of_birth, hire_date, office_location, notes, status, is_complete, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/people/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/people/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM people WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/people/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
