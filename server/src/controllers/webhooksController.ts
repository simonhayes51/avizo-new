import { Request, Response } from 'express';
import { Pool } from 'pg';

export const createWebhooksController = (db: Pool) => {
  // Services are created on-demand with user-specific credentials
  // to support multi-tenant architecture

  // WhatsApp webhook verification and message handling
  const whatsappWebhook = async (req: Request, res: Response) => {
    try {
      // Webhook verification
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        // For webhook verification, we need to check against stored verify token
        // TODO: Implement per-business webhook verification
        if (mode === 'subscribe') {
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);
        }
        return;
      }

      // Handle incoming message
      if (req.method === 'POST') {
        // TODO: Implement per-business WhatsApp message handling
        // Need to identify which business this webhook is for
        console.log('WhatsApp webhook received - per-business handling not yet implemented');
        res.sendStatus(200);
      }
    } catch (error: any) {
      console.error('WhatsApp webhook error:', error);
      res.sendStatus(500);
    }
  };

  // Twilio SMS webhook
  const twilioWebhook = async (req: Request, res: Response) => {
    try {
      // TODO: Implement per-business Twilio webhook handling
      // Need to:
      // 1. Identify which business this webhook is for (by phone number or other identifier)
      // 2. Fetch their Twilio credentials from database
      // 3. Validate webhook signature with their auth token
      // 4. Create TwilioService instance with their credentials
      // 5. Process the incoming message
      console.log('Twilio webhook received - per-business handling not yet implemented');
      res.sendStatus(200);
    } catch (error: any) {
      console.error('Twilio webhook error:', error);
      res.sendStatus(500);
    }
  };

  // Stripe webhook
  const stripeWebhook = async (req: Request, res: Response) => {
    try {
      // Stripe webhooks require platform-level configuration
      // Since each business has their own Stripe account, webhooks should be configured
      // to point to business-specific webhook endpoints or use Connect
      // For now, acknowledge receipt to avoid errors
      console.log('Stripe webhook received - per-business webhook handling not yet implemented');
      res.json({ received: true });
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };

  return {
    whatsappWebhook,
    twilioWebhook,
    stripeWebhook
  };
};
