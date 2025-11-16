import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to get clients' });
  }
};

export const getClient = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM clients WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phoneNumber, email, notes, tags } = req.body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Check if user exists in database
    const userCheck = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(401).json({
        error: 'Your session has expired. Please log out and log in again.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Ensure tags is an array
    const tagsArray = Array.isArray(tags) ? tags : [];

    console.log('Creating client with data:', { userId, name, phoneNumber, email, notes, tags: tagsArray });

    const result = await query(
      `INSERT INTO clients (user_id, name, phone_number, email, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, phoneNumber, email || null, notes || '', tagsArray]
    );

    console.log('Client created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create client error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });

    // Handle foreign key constraint specifically
    if (error.code === '23503') {
      return res.status(401).json({
        error: 'Your session has expired. Please log out and log in again.',
        code: 'SESSION_EXPIRED'
      });
    }

    res.status(500).json({
      error: 'Failed to create client',
      details: error.message,
      code: error.code
    });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, phoneNumber, email, notes, tags } = req.body;

    const result = await query(
      `UPDATE clients
       SET name = $1, phone_number = $2, email = $3, notes = $4, tags = $5, updated_at = now()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, phoneNumber, email, notes, tags, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};
