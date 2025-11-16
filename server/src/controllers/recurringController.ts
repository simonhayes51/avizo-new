import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getRecurringPatterns = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT rp.*, c.name as client_name
       FROM recurring_patterns rp
       LEFT JOIN clients c ON rp.client_id = c.id
       WHERE rp.user_id = $1
       ORDER BY rp.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get recurring patterns error:', error);
    res.status(500).json({ error: 'Failed to get recurring patterns' });
  }
};

export const createRecurringPattern = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      clientId,
      frequency,
      interval,
      daysOfWeek,
      startDate,
      endDate,
      title,
      durationMinutes,
      location,
      notes
    } = req.body;

    const result = await query(
      `INSERT INTO recurring_patterns
       (user_id, client_id, frequency, interval, days_of_week, start_date, end_date,
        title, duration_minutes, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        clientId,
        frequency,
        interval,
        daysOfWeek,
        startDate,
        endDate,
        title,
        durationMinutes,
        location,
        notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create recurring pattern error:', error);
    res.status(500).json({ error: 'Failed to create recurring pattern' });
  }
};

export const updateRecurringPattern = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      frequency,
      interval,
      daysOfWeek,
      endDate,
      isActive
    } = req.body;

    const result = await query(
      `UPDATE recurring_patterns
       SET frequency = COALESCE($1, frequency),
           interval = COALESCE($2, interval),
           days_of_week = COALESCE($3, days_of_week),
           end_date = COALESCE($4, end_date),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [frequency, interval, daysOfWeek, endDate, isActive, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurring pattern not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update recurring pattern error:', error);
    res.status(500).json({ error: 'Failed to update recurring pattern' });
  }
};

export const deleteRecurringPattern = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM recurring_patterns WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurring pattern not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete recurring pattern error:', error);
    res.status(500).json({ error: 'Failed to delete recurring pattern' });
  }
};
