import { Request, Response } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, businessName, businessType, phoneNumber, timezone } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash]
    );

    const userId = userResult.rows[0].id;

    // Create profile
    await query(
      `INSERT INTO profiles (user_id, business_name, business_type, phone_number, timezone)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, businessName, businessType || 'general', phoneNumber, timezone || 'Europe/London']
    );

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({ token, userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({ token, userId: user.id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await query(
      `SELECT u.id, u.email, u.is_demo, p.business_name, p.business_type,
              p.phone_number, p.timezone, p.currency, p.preferences, p.created_at
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { businessName, businessType, phoneNumber, timezone, currency, preferences } = req.body;

    // Build dynamic query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (businessName !== undefined) {
      updates.push(`business_name = $${paramCount++}`);
      values.push(businessName);
    }
    if (businessType !== undefined) {
      updates.push(`business_type = $${paramCount++}`);
      values.push(businessType);
    }
    if (phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(phoneNumber);
    }
    if (timezone !== undefined) {
      updates.push(`timezone = $${paramCount++}`);
      values.push(timezone);
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramCount++}`);
      values.push(currency);
    }
    if (preferences !== undefined) {
      updates.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(preferences));
    }

    updates.push('updated_at = now()');
    values.push(userId);

    await query(
      `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = $${paramCount}`,
      values
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const createDemoAccount = async (req: Request, res: Response) => {
  try {
    // Create demo user with random email
    const demoEmail = `demo_${Date.now()}@avizo.app`;
    const demoPassword = 'demo123'; // Demo accounts have simple password
    const passwordHash = await hashPassword(demoPassword);

    const userResult = await query(
      'INSERT INTO users (email, password_hash, is_demo) VALUES ($1, $2, true) RETURNING id',
      [demoEmail, passwordHash]
    );

    const userId = userResult.rows[0].id;

    // Create demo profile
    await query(
      `INSERT INTO profiles (user_id, business_name, business_type, phone_number, timezone)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "Demo Driving School", "driving_instructor", "+44 7700 900000", "Europe/London"]
    );

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({ token, userId, email: demoEmail });
  } catch (error) {
    console.error('Create demo account error:', error);
    res.status(500).json({ error: 'Failed to create demo account' });
  }
};
