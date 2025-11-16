import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Pool } from 'pg';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private db: Pool;

  constructor(db: Pool) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google OAuth credentials not configured');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    this.db = db;
  }

  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      state: state // Pass user ID or session ID
    });
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      // Store tokens in integrations table
      await this.db.query(
        `INSERT INTO integrations (user_id, provider, credentials, is_active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, provider)
         DO UPDATE SET credentials = $3, is_active = $4, last_synced_at = NOW()`,
        [
          userId,
          'google_calendar',
          JSON.stringify(tokens),
          true
        ]
      );
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      throw new Error(`Failed to authenticate with Google: ${error.message}`);
    }
  }

  async syncAppointmentToGoogle(appointmentId: string, userId: string): Promise<void> {
    try {
      // Get integration credentials
      const integrationResult = await this.db.query(
        'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2 AND is_active = true',
        [userId, 'google_calendar']
      );

      if (integrationResult.rows.length === 0) {
        throw new Error('Google Calendar not connected');
      }

      const credentials = integrationResult.rows[0].credentials;
      this.oauth2Client.setCredentials(credentials);

      // Get appointment details
      const appointmentResult = await this.db.query(
        `SELECT a.*, c.name as client_name, c.email as client_email
         FROM appointments a
         LEFT JOIN clients c ON a.client_id = c.id
         WHERE a.id = $1 AND a.user_id = $2`,
        [appointmentId, userId]
      );

      if (appointmentResult.rows.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentResult.rows[0];

      // Check if already synced
      const syncResult = await this.db.query(
        'SELECT external_event_id FROM calendar_sync WHERE appointment_id = $1 AND provider = $2',
        [appointmentId, 'google_calendar']
      );

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: appointment.title,
        description: appointment.notes || '',
        location: appointment.location || '',
        start: {
          dateTime: appointment.start_time,
          timeZone: 'UTC'
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'UTC'
        },
        attendees: appointment.client_email ? [{ email: appointment.client_email }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      if (syncResult.rows.length > 0) {
        // Update existing event
        const eventId = syncResult.rows[0].external_event_id;
        await calendar.events.update({
          calendarId: 'primary',
          eventId: eventId,
          requestBody: event
        });
      } else {
        // Create new event
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event
        });

        const eventId = response.data.id!;

        // Store sync record
        const integration = await this.db.query(
          'SELECT id FROM integrations WHERE user_id = $1 AND provider = $2',
          [userId, 'google_calendar']
        );

        await this.db.query(
          `INSERT INTO calendar_sync
           (user_id, appointment_id, integration_id, external_event_id, provider)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, appointmentId, integration.rows[0].id, eventId, 'google_calendar']
        );
      }

      // Mark appointment as synced
      await this.db.query(
        'UPDATE appointments SET calendar_synced = true WHERE id = $1',
        [appointmentId]
      );

    } catch (error: any) {
      console.error('Google Calendar sync error:', error);
      throw new Error(`Failed to sync to Google Calendar: ${error.message}`);
    }
  }

  async syncFromGoogle(userId: string): Promise<void> {
    try {
      // Get integration credentials
      const integrationResult = await this.db.query(
        'SELECT id, credentials FROM integrations WHERE user_id = $1 AND provider = $2 AND is_active = true',
        [userId, 'google_calendar']
      );

      if (integrationResult.rows.length === 0) {
        return;
      }

      const integration = integrationResult.rows[0];
      const credentials = integration.credentials;
      this.oauth2Client.setCredentials(credentials);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Get events from the next 30 days
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items || [];

      for (const event of events) {
        if (!event.id || !event.start?.dateTime || !event.end?.dateTime) {
          continue;
        }

        // Check if event is already synced
        const syncResult = await this.db.query(
          'SELECT appointment_id FROM calendar_sync WHERE external_event_id = $1 AND provider = $2',
          [event.id, 'google_calendar']
        );

        if (syncResult.rows.length === 0) {
          // Create new appointment from Google event
          const appointmentResult = await this.db.query(
            `INSERT INTO appointments
             (user_id, title, start_time, end_time, location, notes, calendar_synced)
             VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING id`,
            [
              userId,
              event.summary || 'Untitled Event',
              event.start.dateTime,
              event.end.dateTime,
              event.location || '',
              event.description || ''
            ]
          );

          const appointmentId = appointmentResult.rows[0].id;

          // Create sync record
          await this.db.query(
            `INSERT INTO calendar_sync
             (user_id, appointment_id, integration_id, external_event_id, provider)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, appointmentId, integration.id, event.id, 'google_calendar']
          );
        }
      }

      // Update last synced timestamp
      await this.db.query(
        'UPDATE integrations SET last_synced_at = NOW() WHERE id = $1',
        [integration.id]
      );

    } catch (error: any) {
      console.error('Google Calendar import error:', error);
      throw new Error(`Failed to import from Google Calendar: ${error.message}`);
    }
  }

  async deleteFromGoogle(appointmentId: string, userId: string): Promise<void> {
    try {
      // Get sync record
      const syncResult = await this.db.query(
        `SELECT cs.external_event_id, i.credentials
         FROM calendar_sync cs
         JOIN integrations i ON cs.integration_id = i.id
         WHERE cs.appointment_id = $1 AND cs.provider = $2`,
        [appointmentId, 'google_calendar']
      );

      if (syncResult.rows.length === 0) {
        return;
      }

      const { external_event_id, credentials } = syncResult.rows[0];
      this.oauth2Client.setCredentials(credentials);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: external_event_id
      });

      // Delete sync record
      await this.db.query(
        'DELETE FROM calendar_sync WHERE appointment_id = $1 AND provider = $2',
        [appointmentId, 'google_calendar']
      );

    } catch (error: any) {
      console.error('Google Calendar delete error:', error);
      // Don't throw error, just log it
    }
  }
}
