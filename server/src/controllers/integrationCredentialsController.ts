import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { encrypt, decrypt } from '../utils/encryption';

// Save WhatsApp credentials
export const saveWhatsAppCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { phoneNumberId, businessAccountId, accessToken, verifyToken } = req.body;

    const credentials = {
      phoneNumberId: encrypt(phoneNumberId),
      businessAccountId: encrypt(businessAccountId),
      accessToken: encrypt(accessToken),
      verifyToken: encrypt(verifyToken)
    };

    const result = await query(
      `INSERT INTO integrations (user_id, provider, credentials, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (user_id, provider)
       DO UPDATE SET credentials = $3, is_active = true, updated_at = NOW()
       WHERE integrations.user_id = $1 AND integrations.provider = $2
       RETURNING id, provider, is_active, created_at`,
      [userId, 'whatsapp', JSON.stringify(credentials)]
    );

    res.json({ success: true, integration: result.rows[0] });
  } catch (error: any) {
    console.error('Save WhatsApp credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Save Twilio credentials
export const saveTwilioCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { accountSid, authToken, phoneNumber } = req.body;

    const credentials = {
      accountSid: encrypt(accountSid),
      authToken: encrypt(authToken),
      phoneNumber: encrypt(phoneNumber)
    };

    const result = await query(
      `INSERT INTO integrations (user_id, provider, credentials, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (user_id, provider)
       DO UPDATE SET credentials = $3, is_active = true, updated_at = NOW()
       WHERE integrations.user_id = $1 AND integrations.provider = $2
       RETURNING id, provider, is_active, created_at`,
      [userId, 'twilio', JSON.stringify(credentials)]
    );

    res.json({ success: true, integration: result.rows[0] });
  } catch (error: any) {
    console.error('Save Twilio credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Save Stripe credentials
export const saveStripeCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { secretKey, publishableKey, webhookSecret } = req.body;

    const credentials = {
      secretKey: encrypt(secretKey),
      publishableKey, // Not sensitive, no need to encrypt
      webhookSecret: encrypt(webhookSecret)
    };

    const result = await query(
      `INSERT INTO integrations (user_id, provider, credentials, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (user_id, provider)
       DO UPDATE SET credentials = $3, is_active = true, updated_at = NOW()
       WHERE integrations.user_id = $1 AND integrations.provider = $2
       RETURNING id, provider, is_active, created_at`,
      [userId, 'stripe', JSON.stringify(credentials)]
    );

    res.json({ success: true, integration: result.rows[0] });
  } catch (error: any) {
    console.error('Save Stripe credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Save Email/SMTP credentials
export const saveEmailCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { host, port, secure, user, password } = req.body;

    const credentials = {
      host,
      port,
      secure,
      user,
      password: encrypt(password)
    };

    const result = await query(
      `INSERT INTO integrations (user_id, provider, credentials, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (user_id, provider)
       DO UPDATE SET credentials = $3, is_active = true, updated_at = NOW()
       WHERE integrations.user_id = $1 AND integrations.provider = $2
       RETURNING id, provider, is_active, created_at`,
      [userId, 'email', JSON.stringify(credentials)]
    );

    res.json({ success: true, integration: result.rows[0] });
  } catch (error: any) {
    console.error('Save email credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get credentials for a specific integration (returns masked version)
export const getIntegrationCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { provider } = req.params;

    const result = await query(
      'SELECT id, provider, credentials, is_active, last_synced_at, created_at FROM integrations WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );

    if (result.rows.length === 0) {
      return res.json({ configured: false });
    }

    const integration = result.rows[0];
    const credentials = integration.credentials;

    // Return masked credentials (show only last 4 characters)
    const maskedCredentials: any = {};

    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string' && value.length > 8) {
        // For encrypted values, just indicate they exist
        if (value.includes(':')) {
          maskedCredentials[key] = '••••••••';
        } else {
          maskedCredentials[key] = value;
        }
      } else {
        maskedCredentials[key] = value;
      }
    }

    res.json({
      configured: true,
      provider: integration.provider,
      is_active: integration.is_active,
      last_synced_at: integration.last_synced_at,
      credentials: maskedCredentials
    });
  } catch (error: any) {
    console.error('Get integration credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test WhatsApp connection
export const testWhatsAppConnection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2',
      [userId, 'whatsapp']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'WhatsApp not configured' });
    }

    const credentials = result.rows[0].credentials;
    const accessToken = decrypt(credentials.accessToken);
    const phoneNumberId = decrypt(credentials.phoneNumberId);

    // Test by getting phone number info from WhatsApp API
    const axios = require('axios');
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    res.json({ success: true, message: 'WhatsApp connection successful', data: response.data });
  } catch (error: any) {
    console.error('Test WhatsApp connection error:', error);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
};

// Test Twilio connection
export const testTwilioConnection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2',
      [userId, 'twilio']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Twilio not configured' });
    }

    const credentials = result.rows[0].credentials;
    const accountSid = decrypt(credentials.accountSid);
    const authToken = decrypt(credentials.authToken);

    // Test by fetching account info
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    const account = await client.api.accounts(accountSid).fetch();

    res.json({ success: true, message: 'Twilio connection successful', data: { status: account.status } });
  } catch (error: any) {
    console.error('Test Twilio connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Test Stripe connection
export const testStripeConnection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2',
      [userId, 'stripe']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stripe not configured' });
    }

    const credentials = result.rows[0].credentials;
    const secretKey = decrypt(credentials.secretKey);

    // Test by fetching account info
    const Stripe = require('stripe');
    const stripe = new Stripe(secretKey, { apiVersion: '2025-10-29.clover' });

    const account = await stripe.accounts.retrieve();

    res.json({ success: true, message: 'Stripe connection successful', data: { email: account.email } });
  } catch (error: any) {
    console.error('Test Stripe connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Test Email/SMTP connection
export const testEmailConnection = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2',
      [userId, 'email']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not configured' });
    }

    const credentials = result.rows[0].credentials;
    const password = decrypt(credentials.password);

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: credentials.host,
      port: credentials.port,
      secure: credentials.secure,
      auth: {
        user: credentials.user,
        pass: password
      }
    });

    await transporter.verify();

    res.json({ success: true, message: 'Email connection successful' });
  } catch (error: any) {
    console.error('Test email connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
