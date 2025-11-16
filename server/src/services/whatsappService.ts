import axios from 'axios';
import { Pool } from 'pg';

interface WhatsAppMessage {
  to: string;
  text: string;
}

interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: string;
}

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private baseUrl: string;
  private db: Pool;

  constructor(db: Pool) {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.baseUrl = `https://graph.facebook.com/v18.0`;
    this.db = db;
  }

  async sendMessage(to: string, text: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace(/\D/g, ''), // Remove non-digits
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async handleIncomingMessage(webhookData: any, userId: string): Promise<void> {
    try {
      const entry = webhookData.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (!value?.messages) {
        return;
      }

      const message = value.messages[0] as WhatsAppWebhookMessage;
      const from = message.from;
      const messageText = message.text?.body || '';
      const externalMessageId = message.id;

      // Find or create client by phone number
      const clientResult = await this.db.query(
        'SELECT id FROM clients WHERE user_id = $1 AND phone_number = $2',
        [userId, from]
      );

      let clientId: string;

      if (clientResult.rows.length === 0) {
        // Create new client
        const newClient = await this.db.query(
          'INSERT INTO clients (user_id, name, phone_number) VALUES ($1, $2, $3) RETURNING id',
          [userId, from, from] // Use phone number as name initially
        );
        clientId = newClient.rows[0].id;
      } else {
        clientId = clientResult.rows[0].id;
      }

      // Find or create conversation
      const conversationResult = await this.db.query(
        'SELECT id FROM conversations WHERE user_id = $1 AND client_id = $2',
        [userId, clientId]
      );

      let conversationId: string;

      if (conversationResult.rows.length === 0) {
        const newConversation = await this.db.query(
          'INSERT INTO conversations (user_id, client_id) VALUES ($1, $2) RETURNING id',
          [userId, clientId]
        );
        conversationId = newConversation.rows[0].id;
      } else {
        conversationId = conversationResult.rows[0].id;
      }

      // Store the message
      await this.db.query(
        `INSERT INTO messages
         (conversation_id, sender_type, content, platform, external_message_id, message_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [conversationId, 'client', messageText, 'whatsapp', externalMessageId, 'whatsapp']
      );

      // Update conversation last_message_at and increment unread count
      await this.db.query(
        `UPDATE conversations
         SET last_message_at = NOW(), unread_count = unread_count + 1
         WHERE id = $1`,
        [conversationId]
      );

      // Mark message as read on WhatsApp
      await this.markMessageAsRead(externalMessageId);

    } catch (error: any) {
      console.error('Error handling WhatsApp webhook:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('Error marking message as read:', error.response?.data || error.message);
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }
}
