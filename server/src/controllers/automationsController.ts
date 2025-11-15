import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAutomations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT * FROM automations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get automations error:', error);
    res.status(500).json({ error: 'Failed to get automations' });
  }
};

export const getAutomation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM automations WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get automation error:', error);
    res.status(500).json({ error: 'Failed to get automation' });
  }
};

export const createAutomation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, triggerType, triggerOffsetHours, messageTemplate, isActive } = req.body;

    const result = await query(
      `INSERT INTO automations
       (user_id, name, trigger_type, trigger_offset_hours, message_template, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, triggerType, triggerOffsetHours || 0, messageTemplate, isActive !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
};

export const updateAutomation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, triggerType, triggerOffsetHours, messageTemplate, isActive } = req.body;

    const result = await query(
      `UPDATE automations
       SET name = $1, trigger_type = $2, trigger_offset_hours = $3,
           message_template = $4, is_active = $5, updated_at = now()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, triggerType, triggerOffsetHours, messageTemplate, isActive, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
};

export const deleteAutomation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM automations WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
};

export const getAutomationLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Verify user owns this automation
    const automation = await query(
      `SELECT id FROM automations WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (automation.rows.length === 0) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    const result = await query(
      `SELECT al.*,
              row_to_json(c.*) as client,
              row_to_json(a.*) as appointment
       FROM automation_logs al
       LEFT JOIN clients c ON c.id = al.client_id
       LEFT JOIN appointments a ON a.id = al.appointment_id
       WHERE al.automation_id = $1
       ORDER BY al.executed_at DESC
       LIMIT 100`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get automation logs error:', error);
    res.status(500).json({ error: 'Failed to get automation logs' });
  }
};
