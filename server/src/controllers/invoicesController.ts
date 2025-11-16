import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT i.*, c.name as client_name, c.email as client_email
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      clientId,
      invoiceNumber,
      amount,
      currency,
      lineItems,
      notes,
      dueDate
    } = req.body;

    const result = await query(
      `INSERT INTO invoices
       (user_id, client_id, invoice_number, amount, currency, line_items, notes, due_date, status, issued_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [userId, clientId, invoiceNumber, amount, currency, lineItems, notes, dueDate, 'draft']
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status, paidAt } = req.body;

    const result = await query(
      `UPDATE invoices
       SET status = COALESCE($1, status),
           paid_at = COALESCE($2, paid_at),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [status, paidAt, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
