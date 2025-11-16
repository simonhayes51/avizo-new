import Stripe from 'stripe';
import { Pool } from 'pg';

export class StripeService {
  private stripe: Stripe | null = null;
  private db: Pool;

  constructor(db: Pool, secretKey?: string) {
    this.db = db;

    // Initialize with provided key (either from env or database)
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-10-29.clover'
      });
    }
  }

  private ensureInitialized() {
    if (!this.stripe) {
      throw new Error('Stripe not initialized. Please provide credentials.');
    }
  }

  async createPaymentIntent(
    userId: string,
    appointmentId: string,
    clientId: string,
    amount: number,
    currency: string = 'gbp',
    description?: string
  ): Promise<Stripe.PaymentIntent> {
    this.ensureInitialized();
    try {
      const paymentIntent = await this.stripe!.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        description: description || 'Appointment payment',
        metadata: {
          user_id: userId,
          appointment_id: appointmentId,
          client_id: clientId
        }
      });

      // Store payment record
      await this.db.query(
        `INSERT INTO payments
         (user_id, appointment_id, client_id, amount, currency, status, external_payment_id, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          appointmentId,
          clientId,
          amount,
          currency,
          'pending',
          paymentIntent.id,
          'stripe'
        ]
      );

      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    this.ensureInitialized();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe!.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object as Stripe.Charge);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const paymentId = paymentIntent.id;
    const appointmentId = paymentIntent.metadata.appointment_id;

    // Update payment status
    await this.db.query(
      'UPDATE payments SET status = $1, paid_at = NOW() WHERE external_payment_id = $2',
      ['completed', paymentId]
    );

    // Update appointment payment status
    if (appointmentId) {
      await this.db.query(
        'UPDATE appointments SET payment_status = $1 WHERE id = $2',
        ['paid', appointmentId]
      );
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const paymentId = paymentIntent.id;

    await this.db.query(
      'UPDATE payments SET status = $1 WHERE external_payment_id = $2',
      ['failed', paymentId]
    );
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId = charge.payment_intent as string;

    await this.db.query(
      'UPDATE payments SET status = $1 WHERE external_payment_id = $2',
      ['refunded', paymentIntentId]
    );
  }

  async createCheckoutSession(
    userId: string,
    appointmentId: string,
    clientId: string,
    amount: number,
    currency: string = 'gbp',
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    this.ensureInitialized();
    try {
      // Get appointment details
      const appointmentResult = await this.db.query(
        'SELECT title FROM appointments WHERE id = $1',
        [appointmentId]
      );

      const title = appointmentResult.rows[0]?.title || 'Appointment';

      const session = await this.stripe!.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: title,
                description: 'Appointment payment'
              },
              unit_amount: Math.round(amount * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          appointment_id: appointmentId,
          client_id: clientId
        }
      });

      // Store payment record
      await this.db.query(
        `INSERT INTO payments
         (user_id, appointment_id, client_id, amount, currency, status, external_payment_id, payment_method, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          appointmentId,
          clientId,
          amount,
          currency,
          'pending',
          session.id,
          'stripe',
          JSON.stringify({ session_id: session.id })
        ]
      );

      return session;
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    this.ensureInitialized();
    try {
      const refund = await this.stripe!.refunds.create({
        payment_intent: paymentIntentId
      });

      return refund;
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }
}
