import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/notes/person/:personId — all notes for a person
router.get('/person/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const result = await pool.query(
      `SELECT pn.*,
              TRIM(COALESCE(a.title, '') || ' ' || a.first_name || ' ' || a.last_name) AS author_name
       FROM person_notes pn
       JOIN people a ON pn.author_id = a.id
       WHERE pn.person_id = $1
       ORDER BY pn.created_at ASC`,
      [personId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/notes/person/:personId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notes — create a note
router.post('/', async (req, res) => {
  try {
    const { person_id, author_id, content, parent_id } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = await pool.query(
      `INSERT INTO person_notes (person_id, author_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [person_id, author_id, content.trim(), parent_id || null]
    );
    const note = result.rows[0];
    const author = await pool.query(
      `SELECT TRIM(COALESCE(title, '') || ' ' || first_name || ' ' || last_name) AS author_name FROM people WHERE id = $1`,
      [author_id]
    );
    res.status(201).json({ ...note, author_name: author.rows[0]?.author_name || '' });
  } catch (err) {
    console.error('POST /api/notes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notes/:id — update note content
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = await pool.query(
      `UPDATE person_notes SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [content.trim(), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /api/notes/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id — delete note (CASCADE handles replies)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM person_notes WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/notes/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
