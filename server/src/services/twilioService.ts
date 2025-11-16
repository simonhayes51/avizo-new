import twilio from 'twilio';
import { Pool } from 'pg';

export class TwilioService {
  private client: twilio.Twilio;
  private phoneNumber: string;
  private db: Pool;

  constructor(db: Pool) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(accountSid, authToken);
    this.db = db;
  }

  async sendSMS(to: string, text: string): Promise<any> {
    try {
      const message = await this.client.messages.create({
        body: text,
        from: this.phoneNumber,
        to: to
      });

      return {
        id: message.sid,
        status: message.status,
        to: message.to,
        from: message.from
      };
    } catch (error: any) {
      console.error('Twilio send error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async handleIncomingMessage(webhookData: any, userId: string): Promise<void> {
    try {
      const from = webhookData.From;
      const body = webhookData.Body;
      const messageSid = webhookData.MessageSid;

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
          [userId, from, from]
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
        [conversationId, 'client', body, 'sms', messageSid, 'sms']
      );

      // Update conversation last_message_at and increment unread count
      await this.db.query(
        `UPDATE conversations
         SET last_message_at = NOW(), unread_count = unread_count + 1
         WHERE id = $1`,
        [conversationId]
      );

    } catch (error: any) {
      console.error('Error handling Twilio webhook:', error);
      throw error;
    }
  }

  validateWebhook(signature: string, url: string, params: any): boolean {
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    return twilio.validateRequest(authToken, signature, url, params);
  }
}
