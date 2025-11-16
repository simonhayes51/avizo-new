import { Request, Response } from 'express';
import { query, getDb } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { GoogleCalendarService } from '../services/googleCalendarService';
import { MicrosoftCalendarService } from '../services/microsoftCalendarService';
import { ZoomService } from '../services/zoomService';

export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await query(
      `SELECT id, user_id, provider, is_active, last_synced_at, created_at
       FROM integrations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to get integrations' });
  }
};

export const createIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { provider, credentials } = req.body;

    const result = await query(
      `INSERT INTO integrations (user_id, provider, credentials)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, provider, is_active, last_synced_at, created_at`,
      [userId, provider, credentials || {}]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Failed to create integration' });
  }
};

export const updateIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { isActive, credentials } = req.body;

    const result = await query(
      `UPDATE integrations
       SET is_active = $1, credentials = COALESCE($2, credentials)
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, provider, is_active, last_synced_at, created_at`,
      [isActive, credentials, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
};

export const deleteIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM integrations WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
};

// Google Calendar OAuth
export const googleAuthUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const db = getDb();
    const googleService = new GoogleCalendarService(db);

    const authUrl = googleService.getAuthUrl(userId!);
    res.json({ url: authUrl });
  } catch (error: any) {
    console.error('Google auth URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const userId = state as string;

    const db = getDb();
    const googleService = new GoogleCalendarService(db);

    await googleService.handleCallback(code as string, userId);

    res.redirect(`${process.env.APP_URL}/settings?integration=google_calendar&status=success`);
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.APP_URL}/settings?integration=google_calendar&status=error`);
  }
};

export const syncGoogleCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const db = getDb();
    const googleService = new GoogleCalendarService(db);

    await googleService.syncFromGoogle(userId!);

    res.json({ success: true, message: 'Calendar synced successfully' });
  } catch (error: any) {
    console.error('Google sync error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Microsoft Calendar OAuth
export const microsoftAuthUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const db = getDb();
    const microsoftService = new MicrosoftCalendarService(db);

    const authUrl = microsoftService.getAuthUrl(userId!);
    res.json({ url: authUrl });
  } catch (error: any) {
    console.error('Microsoft auth URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const microsoftCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const userId = state as string;

    const db = getDb();
    const microsoftService = new MicrosoftCalendarService(db);

    await microsoftService.handleCallback(code as string, userId);

    res.redirect(`${process.env.APP_URL}/settings?integration=microsoft_calendar&status=success`);
  } catch (error: any) {
    console.error('Microsoft callback error:', error);
    res.redirect(`${process.env.APP_URL}/settings?integration=microsoft_calendar&status=error`);
  }
};

export const syncMicrosoftCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const db = getDb();
    const microsoftService = new MicrosoftCalendarService(db);

    await microsoftService.syncFromMicrosoft(userId!);

    res.json({ success: true, message: 'Calendar synced successfully' });
  } catch (error: any) {
    console.error('Microsoft sync error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Zoom OAuth
export const zoomAuthUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const db = getDb();
    const zoomService = new ZoomService(db);

    const authUrl = zoomService.getAuthUrl(userId!);
    res.json({ url: authUrl });
  } catch (error: any) {
    console.error('Zoom auth URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const zoomCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const userId = state as string;

    const db = getDb();
    const zoomService = new ZoomService(db);

    await zoomService.handleCallback(code as string, userId);

    res.redirect(`${process.env.APP_URL}/settings?integration=zoom&status=success`);
  } catch (error: any) {
    console.error('Zoom callback error:', error);
    res.redirect(`${process.env.APP_URL}/settings?integration=zoom&status=error`);
  }
};
