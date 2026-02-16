import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/credentials/templates
router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM credential_templates ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/credentials/templates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/credentials/templates
router.post('/templates', async (req, res) => {
  try {
    const { name, category, status, description, image_url, field_placements } = req.body;
    const result = await pool.query(
      `INSERT INTO credential_templates (name, category, status, description, image_url, field_placements)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category, status || 'Active', description, image_url || null, field_placements ? JSON.stringify(field_placements) : '[]']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/credentials/templates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/credentials/templates/:id - single template
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM credential_templates WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/credentials/templates/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/credentials/templates/:id - update a template
router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, status, description, image_url, field_placements } = req.body;

    const fields: string[] = [];
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (image_url !== undefined) {
      fields.push(`image_url = $${paramIndex++}`);
      params.push(image_url);
    }
    if (field_placements !== undefined) {
      fields.push(`field_placements = $${paramIndex++}`);
      params.push(JSON.stringify(field_placements));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(Number(id));
    const result = await pool.query(
      `UPDATE credential_templates SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/credentials/templates/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/credentials/templates/:id - delete a template
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM credential_templates WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/credentials/templates/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/credentials/issued - list issued credentials
router.get('/issued', async (req, res) => {
  try {
    const { person_id, template_id, status } = req.query;
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (person_id) {
      conditions.push(`ic.person_id = $${paramIndex++}`);
      params.push(Number(person_id));
    }
    if (template_id) {
      conditions.push(`ic.template_id = $${paramIndex++}`);
      params.push(Number(template_id));
    }
    if (status) {
      conditions.push(`ic.status = $${paramIndex++}`);
      params.push(String(status));
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(
      `SELECT ic.*,
              ct.name as template_name, ct.category,
              CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                   ELSE p.first_name || ' ' || p.last_name END AS person_name,
              p.email
       FROM issued_credentials ic
       JOIN credential_templates ct ON ic.template_id = ct.id
       JOIN people p ON ic.person_id = p.id
       ${where}
       ORDER BY ic.issue_date DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/credentials/issued error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/credentials/issued - issue a credential
router.post('/issued', async (req, res) => {
  try {
    const { template_id, person_id, issue_date, expiry_date, credential_number, data } = req.body;

    const result = await pool.query(
      `INSERT INTO issued_credentials (template_id, person_id, issue_date, expiry_date, credential_number, data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [template_id, person_id, issue_date || new Date(), expiry_date, credential_number, data ? JSON.stringify(data) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/credentials/issued error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/credentials/distribution - distribution stats
router.get('/distribution', async (req, res) => {
  try {
    const byTemplate = await pool.query(
      `SELECT ct.name, ct.category, COUNT(ic.id) as issued_count,
              SUM(CASE WHEN ic.status = 'ACTIVE' THEN 1 ELSE 0 END) as active_count,
              SUM(CASE WHEN ic.status = 'EXPIRED' THEN 1 ELSE 0 END) as expired_count
       FROM credential_templates ct
       LEFT JOIN issued_credentials ic ON ct.id = ic.template_id
       GROUP BY ct.id, ct.name, ct.category
       ORDER BY ct.name`
    );

    const totalIssued = await pool.query('SELECT COUNT(*) FROM issued_credentials');
    const totalActive = await pool.query("SELECT COUNT(*) FROM issued_credentials WHERE status = 'ACTIVE'");
    const totalExpired = await pool.query("SELECT COUNT(*) FROM issued_credentials WHERE status = 'EXPIRED'");

    res.json({
      templates: byTemplate.rows,
      summary: {
        total: Number(totalIssued.rows[0].count),
        active: Number(totalActive.rows[0].count),
        expired: Number(totalExpired.rows[0].count),
      },
    });
  } catch (err) {
    console.error('GET /api/credentials/distribution error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
