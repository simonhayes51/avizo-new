import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Pool } from 'pg';

export class GoogleMeetService {
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

  async createMeetingForAppointment(appointmentId: string, userId: string): Promise<void> {
    try {
      // Get integration credentials (same as Google Calendar)
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

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Create calendar event with Google Meet
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
        conferenceData: {
          createRequest: {
            requestId: `${appointmentId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === 'video'
      )?.uri;

      if (meetLink) {
        // Update appointment with Google Meet link
        await this.db.query(
          'UPDATE appointments SET video_url = $1, video_platform = $2 WHERE id = $3',
          [meetLink, 'google_meet', appointmentId]
        );

        // Store calendar sync record
        const integration = await this.db.query(
          'SELECT id FROM integrations WHERE user_id = $1 AND provider = $2',
          [userId, 'google_calendar']
        );

        await this.db.query(
          `INSERT INTO calendar_sync
           (user_id, appointment_id, integration_id, external_event_id, provider)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (integration_id, external_event_id) DO NOTHING`,
          [userId, appointmentId, integration.rows[0].id, response.data.id, 'google_meet']
        );
      }

    } catch (error: any) {
      console.error('Google Meet creation error:', error);
      throw new Error(`Failed to create Google Meet: ${error.message}`);
    }
  }

  async deleteMeeting(appointmentId: string, userId: string): Promise<void> {
    try {
      // Get sync record
      const syncResult = await this.db.query(
        `SELECT cs.external_event_id, i.credentials
         FROM calendar_sync cs
         JOIN integrations i ON cs.integration_id = i.id
         WHERE cs.appointment_id = $1 AND cs.provider = $2`,
        [appointmentId, 'google_meet']
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
        [appointmentId, 'google_meet']
      );

    } catch (error: any) {
      console.error('Google Meet delete error:', error);
      // Don't throw error, just log it
    }
  }
}
