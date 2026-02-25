import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/paths
router.get('/', async (req, res) => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`tp.status = $${paramIndex++}`);
      params.push(String(status).toUpperCase());
    }
    if (search) {
      conditions.push(`tp.name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM training_paths tp ${where}`, params);
    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT tp.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS creator_name,
              COUNT(DISTINCT ps.id) AS step_count,
              COUNT(DISTINCT trp.id) AS trainee_count,
              COUNT(DISTINCT ps.step_group) AS phase_count
       FROM training_paths tp
       LEFT JOIN people p ON tp.created_by = p.id
       LEFT JOIN path_steps ps ON ps.path_id = tp.id
       LEFT JOIN trainee_paths trp ON trp.path_id = tp.id
       ${where}
       GROUP BY tp.id, p.id
       ORDER BY tp.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, Number(limit), offset]
    );

    res.json({ data: result.rows, total, page: Number(page), limit: Number(limit) });
  } catch (err: any) {
    console.error('GET /api/paths error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/paths/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT tp.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS creator_name
       FROM training_paths tp
       LEFT JOIN people p ON tp.created_by = p.id
       WHERE tp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training path not found' });
    }

    // Get steps with course info
    const steps = await pool.query(
      `SELECT ps.*,
              c.name AS course_name,
              c.course_number
       FROM path_steps ps
       LEFT JOIN courses c ON ps.course_id = c.id
       WHERE ps.path_id = $1
       ORDER BY ps.step_group, ps.step_order`,
      [id]
    );

    // Get trainees with progress counts
    const trainees = await pool.query(
      `SELECT trp.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS name,
              p.email,
              p.department,
              COUNT(CASE WHEN tsp.status = 'COMPLETED' THEN 1 END) AS progress_count,
              COUNT(tsp.id) AS total_steps
       FROM trainee_paths trp
       JOIN people p ON trp.person_id = p.id
       LEFT JOIN trainee_step_progress tsp ON tsp.trainee_path_id = trp.id
       WHERE trp.path_id = $1
       GROUP BY trp.id, p.id`,
      [id]
    );

    // Get action items for this path (via path_steps or via trainees on this path)
    const actions = await pool.query(
      `SELECT ai.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS person_name
       FROM action_items ai
       JOIN people p ON ai.person_id = p.id
       LEFT JOIN path_steps ps ON ai.path_step_id = ps.id
       WHERE ps.path_id = $1
          OR ai.person_id IN (SELECT person_id FROM trainee_paths WHERE path_id = $1)
       ORDER BY ai.created_at DESC`,
      [id]
    );

    res.json({ ...result.rows[0], steps: steps.rows, trainees: trainees.rows, actions: actions.rows });
  } catch (err: any) {
    console.error('GET /api/paths/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/paths
router.post('/', async (req, res) => {
  try {
    const { name, description, created_by, status } = req.body;

    const result = await pool.query(
      `INSERT INTO training_paths (name, description, created_by, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, created_by, status || 'DRAFT']
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A training path with this name already exists' });
    }
    console.error('POST /api/paths error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/paths/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const allowed = ['name', 'description', 'status'];

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
      `UPDATE training_paths SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training path not found' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('PUT /api/paths/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/paths/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM training_paths WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training path not found' });
    }
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/paths/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/paths/:id/steps - Bulk replace steps
router.put('/:id/steps', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { steps } = req.body;

    await client.query('BEGIN');
    await client.query('DELETE FROM path_steps WHERE path_id = $1', [id]);

    const inserted = [];
    for (const step of steps) {
      const result = await client.query(
        `INSERT INTO path_steps (path_id, course_id, step_group, step_order, is_required)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, step.course_id, step.step_group, step.step_order, step.is_required ?? true]
      );
      inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.json(inserted);
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('PUT /api/paths/:id/steps error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// POST /api/paths/:id/trainees - Enroll trainee (with quick-add support)
router.post('/:id/trainees', async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id, quick_add } = req.body;

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
      `INSERT INTO trainee_paths (person_id, path_id)
       VALUES ($1, $2) RETURNING *`,
      [personId, id]
    );

    const traineePath = result.rows[0];

    // Auto-create trainee_step_progress rows for all existing path_steps
    const steps = await pool.query(
      'SELECT id FROM path_steps WHERE path_id = $1',
      [id]
    );

    for (const step of steps.rows) {
      await pool.query(
        `INSERT INTO trainee_step_progress (trainee_path_id, path_step_id)
         VALUES ($1, $2)`,
        [traineePath.id, step.id]
      );
    }

    res.status(201).json(traineePath);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This person is already enrolled in this training path' });
    }
    console.error('POST /api/paths/:id/trainees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/paths/:id/trainees/:personId - Unenroll trainee
router.delete('/:id/trainees/:personId', async (req, res) => {
  try {
    const { id, personId } = req.params;
    await pool.query(
      'DELETE FROM trainee_paths WHERE path_id = $1 AND person_id = $2',
      [id, personId]
    );
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/paths/:id/trainees/:personId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/paths/:id/trainees/:personId - Update trainee status
router.patch('/:id/trainees/:personId', async (req, res) => {
  try {
    const { id, personId } = req.params;
    const { status } = req.body;

    const completedClause = status === 'COMPLETED' ? ', completed_at = NOW()' : '';

    const result = await pool.query(
      `UPDATE trainee_paths SET status = $1${completedClause}
       WHERE path_id = $2 AND person_id = $3 RETURNING *`,
      [status, id, personId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trainee enrollment not found' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('PATCH /api/paths/:id/trainees/:personId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/paths/:id/progress/:traineePathId - Get step-by-step progress for a trainee
router.get('/:id/progress/:traineePathId', async (req, res) => {
  try {
    const { traineePathId } = req.params;
    const result = await pool.query(
      `SELECT tsp.*, ps.step_group, ps.step_order, ps.is_required,
              c.name AS course_name, c.course_number
       FROM trainee_step_progress tsp
       JOIN path_steps ps ON tsp.path_step_id = ps.id
       LEFT JOIN courses c ON ps.course_id = c.id
       WHERE tsp.trainee_path_id = $1
       ORDER BY ps.step_group, ps.step_order`,
      [traineePathId]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('GET /api/paths/:id/progress/:traineePathId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/paths/:id/progress/:traineePathId/:stepId - Update step progress
router.patch('/:id/progress/:traineePathId/:stepId', async (req, res) => {
  try {
    const { traineePathId, stepId } = req.params;
    const { status } = req.body;

    let extraSets = '';
    if (status === 'IN_PROGRESS') {
      extraSets = ', started_at = COALESCE(started_at, NOW())';
    } else if (status === 'COMPLETED') {
      extraSets = ', started_at = COALESCE(started_at, NOW()), completed_at = NOW()';
    }

    const result = await pool.query(
      `UPDATE trainee_step_progress SET status = $1${extraSets}
       WHERE trainee_path_id = $2 AND path_step_id = $3 RETURNING *`,
      [status, traineePathId, stepId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Step progress record not found' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('PATCH /api/paths/:id/progress/:traineePathId/:stepId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/paths/:id/actions - List action items for this path
router.get('/:id/actions', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ai.*,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS person_name
       FROM action_items ai
       JOIN people p ON ai.person_id = p.id
       JOIN path_steps ps ON ai.path_step_id = ps.id
       WHERE ps.path_id = $1
       ORDER BY ai.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err: any) {
    console.error('GET /api/paths/:id/actions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/paths/:id/actions - Create action item
router.post('/:id/actions', async (req, res) => {
  try {
    const { person_id, path_step_id, title, description, due_date, assigned_by } = req.body;

    const result = await pool.query(
      `INSERT INTO action_items (person_id, path_step_id, title, description, due_date, assigned_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [person_id, path_step_id, title, description, due_date || null, assigned_by || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Duplicate action item' });
    }
    console.error('POST /api/paths/:id/actions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/paths/:id/pipeline - Trainees grouped by current phase
router.get('/:id/pipeline', async (req, res) => {
  try {
    const { id } = req.params;

    // Get all trainees with their current phase (lowest step_group with incomplete steps)
    const result = await pool.query(
      `SELECT
         trp.id AS trainee_path_id,
         trp.person_id,
         trp.status AS trainee_status,
         trp.enrolled_at,
         CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
              ELSE p.first_name || ' ' || p.last_name END AS name,
         p.email,
         COALESCE(
           (SELECT MIN(ps.step_group)
            FROM trainee_step_progress tsp
            JOIN path_steps ps ON tsp.path_step_id = ps.id
            WHERE tsp.trainee_path_id = trp.id
              AND tsp.status IN ('NOT_STARTED', 'IN_PROGRESS')),
           (SELECT MAX(ps.step_group)
            FROM path_steps ps
            WHERE ps.path_id = trp.path_id)
         ) AS current_phase
       FROM trainee_paths trp
       JOIN people p ON trp.person_id = p.id
       WHERE trp.path_id = $1
       ORDER BY current_phase, name`,
      [id]
    );

    // Group by current_phase
    const pipeline: Record<number, any[]> = {};
    for (const row of result.rows) {
      const phase = row.current_phase;
      if (!pipeline[phase]) {
        pipeline[phase] = [];
      }
      pipeline[phase].push(row);
    }

    res.json(pipeline);
  } catch (err: any) {
    console.error('GET /api/paths/:id/pipeline error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
