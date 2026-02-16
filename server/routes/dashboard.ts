import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/dashboard - aggregated stats
// Optional query params: from (YYYY-MM-DD), to (YYYY-MM-DD)
router.get('/', async (req, res) => {
  try {
    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;
    const hasDateFilter = !!(fromParam && toParam);

    // Total personnel (always global)
    const personnelResult = await pool.query('SELECT COUNT(*) FROM people');
    const totalPersonnel = Number(personnelResult.rows[0].count);

    // Active courses (always global)
    const coursesResult = await pool.query("SELECT COUNT(*) FROM courses WHERE status = 'ACTIVE'");
    const activeCourses = Number(coursesResult.rows[0].count);

    // Meetings count - filtered by date range or default to this week
    let meetingsResult;
    if (hasDateFilter) {
      meetingsResult = await pool.query(
        `SELECT COUNT(*) FROM meetings
         WHERE meeting_date >= $1::date
         AND meeting_date < ($2::date + INTERVAL '1 day')`,
        [fromParam, toParam]
      );
    } else {
      meetingsResult = await pool.query(
        `SELECT COUNT(*) FROM meetings
         WHERE meeting_date >= DATE_TRUNC('week', CURRENT_DATE)
         AND meeting_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`
      );
    }
    const meetingsThisWeek = Number(meetingsResult.rows[0].count);

    // CME credits pending (always global)
    const cmePending = await pool.query(
      "SELECT COUNT(*) FROM cme_activities WHERE status = 'PENDING'"
    );
    const pendingCredits = Number(cmePending.rows[0].count);

    // Recent meetings - filtered by date range or default to latest 4
    let recentMeetings;
    if (hasDateFilter) {
      recentMeetings = await pool.query(
        `SELECT m.id, m.title, m.meeting_date, m.status
         FROM meetings m
         WHERE m.meeting_date >= $1::date
         AND m.meeting_date < ($2::date + INTERVAL '1 day')
         ORDER BY m.meeting_date DESC
         LIMIT 4`,
        [fromParam, toParam]
      );
    } else {
      recentMeetings = await pool.query(
        `SELECT m.id, m.title, m.meeting_date, m.status
         FROM meetings m
         ORDER BY m.meeting_date DESC
         LIMIT 4`
      );
    }

    // Recent activity log - filtered by date range or default
    let recentActivity;
    if (hasDateFilter) {
      recentActivity = await pool.query(`
        (SELECT 'cme_credit' as type,
                'CME Credit Approved' as title,
                CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                     ELSE p.first_name || ' ' || p.last_name END || ' | ' || ca.activity_type || ' Credits' as detail,
                cc.created_at
         FROM cme_credits cc
         JOIN people p ON cc.person_id = p.id
         JOIN cme_activities ca ON cc.activity_id = ca.id
         WHERE cc.verified = true
         AND cc.created_at >= $1::date
         AND cc.created_at < ($2::date + INTERVAL '1 day')
         ORDER BY cc.created_at DESC LIMIT 2)
        UNION ALL
        (SELECT 'person_added' as type,
                'New Person Added' as title,
                CASE WHEN title != '' THEN title || ' ' || first_name || ' ' || last_name
                     ELSE first_name || ' ' || last_name END || ' added to ' || COALESCE(role, 'staff') as detail,
                created_at
         FROM people
         WHERE created_at >= $1::date
         AND created_at < ($2::date + INTERVAL '1 day')
         ORDER BY created_at DESC LIMIT 1)
        UNION ALL
        (SELECT 'meeting_scheduled' as type,
                'Meeting Scheduled' as title,
                title || ' - ' || COALESCE(location, '') as detail,
                created_at
         FROM meetings
         WHERE status = 'SCHEDULED'
         AND created_at >= $1::date
         AND created_at < ($2::date + INTERVAL '1 day')
         ORDER BY created_at DESC LIMIT 1)
        ORDER BY created_at DESC
        LIMIT 4
      `, [fromParam, toParam]);
    } else {
      recentActivity = await pool.query(`
        (SELECT 'cme_credit' as type,
                'CME Credit Approved' as title,
                CASE WHEN p.title != '' THEN p.title || ' ' || p.first_name || ' ' || p.last_name
                     ELSE p.first_name || ' ' || p.last_name END || ' | ' || ca.activity_type || ' Credits' as detail,
                cc.created_at
         FROM cme_credits cc
         JOIN people p ON cc.person_id = p.id
         JOIN cme_activities ca ON cc.activity_id = ca.id
         WHERE cc.verified = true
         ORDER BY cc.created_at DESC LIMIT 2)
        UNION ALL
        (SELECT 'person_added' as type,
                'New Person Added' as title,
                CASE WHEN title != '' THEN title || ' ' || first_name || ' ' || last_name
                     ELSE first_name || ' ' || last_name END || ' added to ' || COALESCE(role, 'staff') as detail,
                created_at
         FROM people ORDER BY created_at DESC LIMIT 1)
        UNION ALL
        (SELECT 'meeting_scheduled' as type,
                'Meeting Scheduled' as title,
                title || ' - ' || COALESCE(location, '') as detail,
                created_at
         FROM meetings WHERE status = 'SCHEDULED' ORDER BY created_at DESC LIMIT 1)
        ORDER BY created_at DESC
        LIMIT 4
      `);
    }

    // Incomplete people count (quick-added, need full info)
    const incompleteResult = await pool.query(
      'SELECT COUNT(*) FROM people WHERE is_complete = false'
    );
    const incompletePeople = Number(incompleteResult.rows[0].count);

    res.json({
      stats: {
        totalPersonnel,
        activeCourses,
        meetingsThisWeek,
        pendingCredits,
        incompletePeople,
      },
      recentMeetings: recentMeetings.rows,
      recentActivity: recentActivity.rows,
      dateFiltered: hasDateFilter,
    });
  } catch (err) {
    console.error('GET /api/dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
