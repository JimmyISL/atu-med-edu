import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/cme - list all CME activities
router.get('/', async (req, res) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`status = $${paramIndex++}`);
      params.push(String(status).toUpperCase());
    }
    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR provider ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM cme_activities ${where}`, params);
    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM cme_activities ${where}
       ORDER BY activity_date DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, Number(limit), offset]
    );

    res.json({ data: result.rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('GET /api/cme error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cme/transcript/:personId - CME transcript for a person
router.get('/transcript/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const credits = await pool.query(
      `SELECT cc.*, ca.name as activity_name, ca.provider, ca.activity_type, ca.credits as total_credits
       FROM cme_credits cc
       JOIN cme_activities ca ON cc.activity_id = ca.id
       WHERE cc.person_id = $1
       ORDER BY cc.date_earned DESC`,
      [personId]
    );

    const totalCredits = await pool.query(
      `SELECT COALESCE(SUM(credits_earned), 0) as total,
              COALESCE(SUM(CASE WHEN verified THEN credits_earned ELSE 0 END), 0) as verified
       FROM cme_credits WHERE person_id = $1`,
      [personId]
    );

    res.json({
      credits: credits.rows,
      summary: totalCredits.rows[0],
    });
  } catch (err) {
    console.error('GET /api/cme/transcript error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cme/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cme_activities WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Get participants who earned credits for this activity
    const participants = await pool.query(
      `SELECT cc.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS name,
              p.email, p.department
       FROM cme_credits cc JOIN people p ON cc.person_id = p.id
       WHERE cc.activity_id = $1`,
      [id]
    );

    res.json({ ...result.rows[0], participants: participants.rows });
  } catch (err) {
    console.error('GET /api/cme/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cme
router.post('/', async (req, res) => {
  try {
    const { name, provider, activity_type, credits, value, activity_date, description, status } = req.body;

    const result = await pool.query(
      `INSERT INTO cme_activities (name, provider, activity_type, credits, value, activity_date, description, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, provider, activity_type || 'Category 1', credits || 0, value || 0, activity_date, description, status || 'PENDING']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/cme error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/cme/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const allowed = ['name', 'provider', 'activity_type', 'credits', 'value', 'activity_date', 'description', 'status'];

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
      `UPDATE cme_activities SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/cme/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cme/:id/credits - award credits to a person
router.post('/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id, credits_earned, date_earned } = req.body;

    const result = await pool.query(
      `INSERT INTO cme_credits (person_id, activity_id, credits_earned, date_earned)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [person_id, id, credits_earned, date_earned || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Credits already awarded to this person for this activity' });
    }
    console.error('POST /api/cme/:id/credits error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/cme/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cme_activities WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/cme/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
