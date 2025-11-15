import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT id, user_id, provider, is_active, last_synced_at, created_at
       FROM integrations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to get integrations' });
  }
};

export const createIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { provider, credentials } = req.body;

    const result = await query(
      `INSERT INTO integrations (user_id, provider, credentials)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, provider, is_active, last_synced_at, created_at`,
      [userId, provider, credentials || {}]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
};

export const updateIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { isActive, credentials } = req.body;

    const result = await query(
      `UPDATE integrations
       SET is_active = $1, credentials = COALESCE($2, credentials)
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, provider, is_active, last_synced_at, created_at`,
      [isActive, credentials, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
};

export const deleteIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM integrations WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
};
