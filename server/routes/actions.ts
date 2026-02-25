import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const ALLOWED_FIELDS = ['title', 'description', 'due_date', 'status'];

// PATCH /api/actions/:id — Update an action item
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields: string[] = [];
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        params.push(req.body[key]);
      }
    }

    // If status is being set to DONE, also set completed_at
    if (req.body.status === 'DONE') {
      fields.push(`completed_at = NOW()`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(Number(id));
    const result = await pool.query(
      `UPDATE action_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('PATCH /api/actions/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/actions/:id — Delete an action item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM action_items WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }
    res.json({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/actions/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
