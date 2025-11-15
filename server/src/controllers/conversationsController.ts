import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT c.*,
              row_to_json(cl.*) as client,
              (SELECT content FROM messages
               WHERE conversation_id = c.id
               ORDER BY created_at DESC LIMIT 1) as last_message
       FROM conversations c
       LEFT JOIN clients cl ON cl.id = c.client_id
       WHERE c.user_id = $1
       ORDER BY c.last_message_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `SELECT c.*,
              row_to_json(cl.*) as client
       FROM conversations c
       LEFT JOIN clients cl ON cl.id = c.client_id
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { clientId } = req.body;

    // Check if conversation already exists
    const existing = await query(
      `SELECT * FROM conversations WHERE user_id = $1 AND client_id = $2`,
      [userId, clientId]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    const result = await query(
      `INSERT INTO conversations (user_id, client_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, clientId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    // Verify user owns this conversation
    const convResult = await query(
      `SELECT id FROM conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const result = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { content, senderType, messageType } = req.body;

    // Verify user owns this conversation
    const convResult = await query(
      `SELECT id FROM conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const result = await query(
      `INSERT INTO messages (conversation_id, sender_type, content, message_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, senderType || 'business', content, messageType || 'sms']
    );

    // Update conversation last_message_at
    await query(
      `UPDATE conversations SET last_message_at = now() WHERE id = $1`,
      [conversationId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
