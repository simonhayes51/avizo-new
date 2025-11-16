import { Router } from 'express';
import { getDb } from '../config/database';
import { createWebhooksController } from '../controllers/webhooksController';

const router = Router();
const db = getDb();
const webhooksController = createWebhooksController(db);

// WhatsApp webhook (GET for verification, POST for messages)
router.get('/whatsapp', webhooksController.whatsappWebhook);
router.post('/whatsapp', webhooksController.whatsappWebhook);

// Twilio SMS webhook
router.post('/twilio', webhooksController.twilioWebhook);

// Stripe webhook
router.post('/stripe', webhooksController.stripeWebhook);

export default router;
