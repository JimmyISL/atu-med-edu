import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();

const SSO_SECRET = process.env.SSO_SECRET || 'atu-neuropro-sso-shared-secret-change-me';

// POST /api/sso/verify - Verify an SSO token and return user info
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify JWT signature and expiration
    let payload: any;
    try {
      payload = jwt.verify(token, SSO_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    const email = payload.email;
    if (!email) {
      return res.status(400).json({ error: 'Token missing email' });
    }

    // Look up person in the people table
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, department, title
       FROM people
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (result.rows.length > 0) {
      const person = result.rows[0];
      const name = person.title
        ? `${person.title} ${person.first_name} ${person.last_name}`
        : `${person.first_name} ${person.last_name}`;
      const initials = `${person.first_name[0] || ''}${person.last_name[0] || ''}`.toUpperCase();

      return res.json({
        email: person.email,
        name,
        initials,
        role: person.role || 'User',
        person_id: person.id,
      });
    }

    // If not found in people table, still allow login with basic info from token
    const name = payload.name || email.split('@')[0];
    const initials = name.split(' ').map((w: string) => w[0] || '').join('').toUpperCase().substring(0, 2);

    res.json({
      email,
      name,
      initials: initials || 'U',
      role: payload.role || 'User',
    });
  } catch (err: any) {
    console.error('POST /api/sso/verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sso/generate-test-token - Dev helper to generate a test SSO token
// Remove this in production
if (process.env.NODE_ENV !== 'production') {
  router.get('/generate-test-token', (req, res) => {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ error: 'email query param required' });
    }
    const token = jwt.sign({ email }, SSO_SECRET, { expiresIn: '5m' });
    const ssoUrl = `${req.protocol}://${req.get('host')}/sso?token=${token}`;
    res.json({ token, ssoUrl });
  });
}

export default router;
