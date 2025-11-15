import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { date, startDate, endDate } = req.query;

    let queryText = `
      SELECT a.*,
             row_to_json(c.*) as client
      FROM appointments a
      LEFT JOIN clients c ON c.id = a.client_id
      WHERE a.user_id = $1
    `;

    const params: any[] = [userId];

    if (date) {
      queryText += ` AND DATE(a.start_time) = $2`;
      params.push(date);
    } else if (startDate && endDate) {
      queryText += ` AND a.start_time >= $2 AND a.start_time <= $3`;
      params.push(startDate, endDate);
    }

    queryText += ` ORDER BY a.start_time ASC`;

    const result = await query(queryText, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
};

export const getAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `SELECT a.*,
              row_to_json(c.*) as client
       FROM appointments a
       LEFT JOIN clients c ON c.id = a.client_id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to get appointment' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { clientId, title, startTime, endTime, status, location, notes, isGap } = req.body;

    const result = await query(
      `INSERT INTO appointments
       (user_id, client_id, title, start_time, end_time, status, location, notes, is_gap)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, clientId || null, title, startTime, endTime, status || 'scheduled', location || '', notes || '', isGap || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { clientId, title, startTime, endTime, status, location, notes, isGap } = req.body;

    const result = await query(
      `UPDATE appointments
       SET client_id = $1, title = $2, start_time = $3, end_time = $4,
           status = $5, location = $6, notes = $7, is_gap = $8, updated_at = now()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [clientId, title, startTime, endTime, status, location, notes, isGap, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};
