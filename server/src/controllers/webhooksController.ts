import { Request, Response } from 'express';
import { Pool } from 'pg';
import { WhatsAppService } from '../services/whatsappService';
import { TwilioService } from '../services/twilioService';
import { StripeService } from '../services/stripeService';

export const createWebhooksController = (db: Pool) => {
  const whatsappService = new WhatsAppService(db);
  const twilioService = new TwilioService(db);
  const stripeService = new StripeService(db);

  // WhatsApp webhook verification and message handling
  const whatsappWebhook = async (req: Request, res: Response) => {
    try {
      // Webhook verification
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        const verifyResult = whatsappService.verifyWebhook(
          mode as string,
          token as string,
          challenge as string
        );

        if (verifyResult) {
          res.status(200).send(verifyResult);
        } else {
          res.sendStatus(403);
        }
        return;
      }

      // Handle incoming message
      if (req.method === 'POST') {
        const body = req.body;

        // Extract user_id from business phone number or use a mapping
        // For now, we'll need to find the user by their WhatsApp credentials
        const userResult = await db.query(
          `SELECT user_id FROM integrations
           WHERE provider = 'whatsapp'
           AND is_active = true
           LIMIT 1`
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].user_id;
          await whatsappService.handleIncomingMessage(body, userId);
        }

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
      const signature = req.headers['x-twilio-signature'] as string;
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      // Validate webhook signature
      const isValid = twilioService.validateWebhook(signature, url, req.body);

      if (!isValid) {
        res.sendStatus(403);
        return;
      }

      // Find user by Twilio phone number
      const userResult = await db.query(
        `SELECT user_id FROM integrations
         WHERE provider = 'twilio'
         AND is_active = true
         LIMIT 1`
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].user_id;
        await twilioService.handleIncomingMessage(req.body, userId);
      }

      res.sendStatus(200);
    } catch (error: any) {
      console.error('Twilio webhook error:', error);
      res.sendStatus(500);
    }
  };

  // Stripe webhook
  const stripeWebhook = async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;

      // req.body should be raw body for Stripe
      await stripeService.handleWebhook(req.body, signature);

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
