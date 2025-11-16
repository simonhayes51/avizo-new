import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getWaitingList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let queryText = `
      SELECT wl.*, c.name as client_name, c.phone_number, c.email
      FROM waiting_list wl
      LEFT JOIN clients c ON wl.client_id = c.id
      WHERE wl.user_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      queryText += ` AND wl.status = $2`;
      params.push(status);
    }

    queryText += ` ORDER BY wl.priority DESC, wl.created_at ASC`;

    const result = await query(queryText, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get waiting list error:', error);
    res.status(500).json({ error: 'Failed to get waiting list' });
  }
};

export const addToWaitingList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      clientId,
      preferredDates,
      preferredTimes,
      durationMinutes,
      notes,
      priority
    } = req.body;

    const result = await query(
      `INSERT INTO waiting_list
       (user_id, client_id, preferred_dates, preferred_times, duration_minutes, notes, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, clientId, preferredDates, preferredTimes, durationMinutes, notes, priority || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add to waiting list error:', error);
    res.status(500).json({ error: 'Failed to add to waiting list' });
  }
};

export const updateWaitingListEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status, priority, notes } = req.body;

    const result = await query(
      `UPDATE waiting_list
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [status, priority, notes, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waiting list entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update waiting list error:', error);
    res.status(500).json({ error: 'Failed to update waiting list entry' });
  }
};

export const deleteWaitingListEntry = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM waiting_list WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waiting list entry not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete waiting list entry error:', error);
    res.status(500).json({ error: 'Failed to delete waiting list entry' });
  }
};
