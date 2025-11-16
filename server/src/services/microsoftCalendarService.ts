import axios from 'axios';
import { Pool } from 'pg';

export class MicrosoftCalendarService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private db: Pool;

  constructor(db: Pool) {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || '';
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
    this.redirectUri = process.env.MICROSOFT_REDIRECT_URI || '';
    this.db = db;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Microsoft OAuth credentials not configured');
    }
  }

  getAuthUrl(state: string): string {
    const scopes = ['Calendars.ReadWrite', 'offline_access'];
    const baseUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      response_mode: 'query',
      scope: scopes.join(' '),
      state: state
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      });

      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokens = response.data;

      // Store tokens in integrations table
      await this.db.query(
        `INSERT INTO integrations (user_id, provider, credentials, is_active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, provider)
         DO UPDATE SET credentials = $3, is_active = $4, last_synced_at = NOW()`,
        [
          userId,
          'microsoft_calendar',
          JSON.stringify(tokens),
          true
        ]
      );
    } catch (error: any) {
      console.error('Microsoft OAuth error:', error.response?.data || error);
      throw new Error(`Failed to authenticate with Microsoft: ${error.message}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  }

  async getAccessToken(userId: string): Promise<string> {
    const integrationResult = await this.db.query(
      'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2 AND is_active = true',
      [userId, 'microsoft_calendar']
    );

    if (integrationResult.rows.length === 0) {
      throw new Error('Microsoft Calendar not connected');
    }

    const credentials = integrationResult.rows[0].credentials;

    // Check if token needs refresh (simplified - you may want to store expiry)
    if (credentials.refresh_token) {
      try {
        const newTokens = await this.refreshAccessToken(credentials.refresh_token);

        // Update stored credentials
        await this.db.query(
          'UPDATE integrations SET credentials = $1 WHERE user_id = $2 AND provider = $3',
          [JSON.stringify(newTokens), userId, 'microsoft_calendar']
        );

        return newTokens.access_token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return credentials.access_token;
      }
    }

    return credentials.access_token;
  }

  async syncAppointmentToMicrosoft(appointmentId: string, userId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(userId);

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
        [appointmentId, 'microsoft_calendar']
      );

      const event = {
        subject: appointment.title,
        body: {
          contentType: 'HTML',
          content: appointment.notes || ''
        },
        start: {
          dateTime: appointment.start_time,
          timeZone: 'UTC'
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'UTC'
        },
        location: {
          displayName: appointment.location || ''
        },
        attendees: appointment.client_email ? [{
          emailAddress: {
            address: appointment.client_email,
            name: appointment.client_name
          },
          type: 'required'
        }] : []
      };

      if (syncResult.rows.length > 0) {
        // Update existing event
        const eventId = syncResult.rows[0].external_event_id;
        await axios.patch(
          `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
          event,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new event
        const response = await axios.post(
          'https://graph.microsoft.com/v1.0/me/events',
          event,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const eventId = response.data.id;

        // Store sync record
        const integration = await this.db.query(
          'SELECT id FROM integrations WHERE user_id = $1 AND provider = $2',
          [userId, 'microsoft_calendar']
        );

        await this.db.query(
          `INSERT INTO calendar_sync
           (user_id, appointment_id, integration_id, external_event_id, provider)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, appointmentId, integration.rows[0].id, eventId, 'microsoft_calendar']
        );
      }

      // Mark appointment as synced
      await this.db.query(
        'UPDATE appointments SET calendar_synced = true WHERE id = $1',
        [appointmentId]
      );

    } catch (error: any) {
      console.error('Microsoft Calendar sync error:', error.response?.data || error);
      throw new Error(`Failed to sync to Microsoft Calendar: ${error.message}`);
    }
  }

  async syncFromMicrosoft(userId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(userId);

      const integrationResult = await this.db.query(
        'SELECT id FROM integrations WHERE user_id = $1 AND provider = $2 AND is_active = true',
        [userId, 'microsoft_calendar']
      );

      if (integrationResult.rows.length === 0) {
        return;
      }

      const integration = integrationResult.rows[0];

      // Get events from the next 30 days
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/calendar/calendarView',
        {
          params: {
            startDateTime: now.toISOString(),
            endDateTime: futureDate.toISOString()
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const events = response.data.value || [];

      for (const event of events) {
        if (!event.id || !event.start?.dateTime || !event.end?.dateTime) {
          continue;
        }

        // Check if event is already synced
        const syncResult = await this.db.query(
          'SELECT appointment_id FROM calendar_sync WHERE external_event_id = $1 AND provider = $2',
          [event.id, 'microsoft_calendar']
        );

        if (syncResult.rows.length === 0) {
          // Create new appointment from Microsoft event
          const appointmentResult = await this.db.query(
            `INSERT INTO appointments
             (user_id, title, start_time, end_time, location, notes, calendar_synced)
             VALUES ($1, $2, $3, $4, $5, $6, true)
             RETURNING id`,
            [
              userId,
              event.subject || 'Untitled Event',
              event.start.dateTime,
              event.end.dateTime,
              event.location?.displayName || '',
              event.body?.content || ''
            ]
          );

          const appointmentId = appointmentResult.rows[0].id;

          // Create sync record
          await this.db.query(
            `INSERT INTO calendar_sync
             (user_id, appointment_id, integration_id, external_event_id, provider)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, appointmentId, integration.id, event.id, 'microsoft_calendar']
          );
        }
      }

      // Update last synced timestamp
      await this.db.query(
        'UPDATE integrations SET last_synced_at = NOW() WHERE id = $1',
        [integration.id]
      );

    } catch (error: any) {
      console.error('Microsoft Calendar import error:', error.response?.data || error);
      throw new Error(`Failed to import from Microsoft Calendar: ${error.message}`);
    }
  }

  async deleteFromMicrosoft(appointmentId: string, userId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(userId);

      // Get sync record
      const syncResult = await this.db.query(
        'SELECT external_event_id FROM calendar_sync WHERE appointment_id = $1 AND provider = $2',
        [appointmentId, 'microsoft_calendar']
      );

      if (syncResult.rows.length === 0) {
        return;
      }

      const externalEventId = syncResult.rows[0].external_event_id;

      await axios.delete(
        `https://graph.microsoft.com/v1.0/me/events/${externalEventId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Delete sync record
      await this.db.query(
        'DELETE FROM calendar_sync WHERE appointment_id = $1 AND provider = $2',
        [appointmentId, 'microsoft_calendar']
      );

    } catch (error: any) {
      console.error('Microsoft Calendar delete error:', error.response?.data || error);
      // Don't throw error, just log it
    }
  }
}
