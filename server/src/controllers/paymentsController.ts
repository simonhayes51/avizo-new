import { Response } from 'express';
import { query, getDb } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { StripeService } from '../services/stripeService';

const stripeService = new StripeService(getDb());

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT p.*, c.name as client_name, a.title as appointment_title
       FROM payments p
       LEFT JOIN clients c ON p.client_id = c.id
       LEFT JOIN appointments a ON p.appointment_id = a.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
};

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { appointmentId, clientId, amount, currency, description } = req.body;

    const paymentIntent = await stripeService.createPaymentIntent(
      userId,
      appointmentId,
      clientId,
      amount,
      currency,
      description
    );

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { appointmentId, clientId, amount, currency, successUrl, cancelUrl } = req.body;

    const session = await stripeService.createCheckoutSession(
      userId,
      appointmentId,
      clientId,
      amount,
      currency,
      successUrl,
      cancelUrl
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const refundPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    const refund = await stripeService.refundPayment(paymentIntentId);

    res.json({ success: true, refund });
  } catch (error: any) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: error.message });
  }
};
