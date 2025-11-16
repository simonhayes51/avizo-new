import axios from 'axios';
import { Pool } from 'pg';

export class ZoomService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private db: Pool;

  constructor(db: Pool) {
    this.clientId = process.env.ZOOM_CLIENT_ID || '';
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET || '';
    this.redirectUri = process.env.ZOOM_REDIRECT_URI || '';
    this.db = db;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Zoom OAuth credentials not configured');
    }
  }

  getAuthUrl(state: string): string {
    const baseUrl = 'https://zoom.us/oauth/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const tokenUrl = 'https://zoom.us/oauth/token';

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      });

      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokens = response.data;

      // Store tokens in integrations table
      await this.db.query(
        `INSERT INTO integrations (user_id, provider, credentials, is_active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, provider)
         DO UPDATE SET credentials = $3, is_active = $4`,
        [
          userId,
          'zoom',
          JSON.stringify(tokens),
          true
        ]
      );
    } catch (error: any) {
      console.error('Zoom OAuth error:', error.response?.data || error);
      throw new Error(`Failed to authenticate with Zoom: ${error.message}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const tokenUrl = 'https://zoom.us/oauth/token';
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  }

  async getAccessToken(userId: string): Promise<string> {
    const integrationResult = await this.db.query(
      'SELECT credentials FROM integrations WHERE user_id = $1 AND provider = $2 AND is_active = true',
      [userId, 'zoom']
    );

    if (integrationResult.rows.length === 0) {
      throw new Error('Zoom not connected');
    }

    const credentials = integrationResult.rows[0].credentials;

    // Refresh token if needed
    if (credentials.refresh_token) {
      try {
        const newTokens = await this.refreshAccessToken(credentials.refresh_token);

        // Update stored credentials
        await this.db.query(
          'UPDATE integrations SET credentials = $1 WHERE user_id = $2 AND provider = $3',
          [JSON.stringify(newTokens), userId, 'zoom']
        );

        return newTokens.access_token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return credentials.access_token;
      }
    }

    return credentials.access_token;
  }

  async createMeeting(
    userId: string,
    topic: string,
    startTime: Date,
    durationMinutes: number,
    timezone: string = 'UTC'
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken(userId);

      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: topic,
          type: 2, // Scheduled meeting
          start_time: startTime.toISOString(),
          duration: durationMinutes,
          timezone: timezone,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            audio: 'both',
            auto_recording: 'none'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Zoom create meeting error:', error.response?.data || error);
      throw new Error(`Failed to create Zoom meeting: ${error.message}`);
    }
  }

  async createMeetingForAppointment(appointmentId: string, userId: string): Promise<void> {
    try {
      // Get appointment details
      const appointmentResult = await this.db.query(
        'SELECT title, start_time, end_time FROM appointments WHERE id = $1 AND user_id = $2',
        [appointmentId, userId]
      );

      if (appointmentResult.rows.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentResult.rows[0];
      const startTime = new Date(appointment.start_time);
      const endTime = new Date(appointment.end_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const meeting = await this.createMeeting(
        userId,
        appointment.title,
        startTime,
        durationMinutes
      );

      // Update appointment with Zoom link
      await this.db.query(
        'UPDATE appointments SET video_url = $1, video_platform = $2 WHERE id = $3',
        [meeting.join_url, 'zoom', appointmentId]
      );

    } catch (error: any) {
      console.error('Create Zoom meeting for appointment error:', error);
      throw error;
    }
  }

  async deleteMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken(userId);

      await axios.delete(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
    } catch (error: any) {
      console.error('Zoom delete meeting error:', error.response?.data || error);
      // Don't throw error, just log it
    }
  }
}
