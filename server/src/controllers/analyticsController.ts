import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    // Total clients
    const clientsResult = await query(
      `SELECT COUNT(*) as total FROM clients WHERE user_id = $1`,
      [userId]
    );

    // Total appointments
    let appointmentsQuery = `SELECT COUNT(*) as total FROM appointments WHERE user_id = $1`;
    const appointmentsParams: any[] = [userId];

    if (startDate && endDate) {
      appointmentsQuery += ` AND start_time >= $2 AND start_time <= $3`;
      appointmentsParams.push(startDate, endDate);
    }

    const appointmentsResult = await query(appointmentsQuery, appointmentsParams);

    // Appointments by status
    let statusQuery = `
      SELECT status, COUNT(*) as count
      FROM appointments
      WHERE user_id = $1
    `;
    const statusParams: any[] = [userId];

    if (startDate && endDate) {
      statusQuery += ` AND start_time >= $2 AND start_time <= $3`;
      statusParams.push(startDate, endDate);
    }

    statusQuery += ` GROUP BY status`;

    const statusResult = await query(statusQuery, statusParams);

    // Appointments by date (last 30 days)
    const dailyQuery = `
      SELECT DATE(start_time) as date, COUNT(*) as count
      FROM appointments
      WHERE user_id = $1
        AND start_time >= NOW() - INTERVAL '30 days'
        AND is_gap = false
      GROUP BY DATE(start_time)
      ORDER BY date DESC
    `;

    const dailyResult = await query(dailyQuery, [userId]);

    // Revenue (if we had a price field, this would be calculated)
    // For now, just return average appointments per day
    const avgQuery = `
      SELECT
        ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT DATE(start_time)), 0), 2) as avg_per_day
      FROM appointments
      WHERE user_id = $1
        AND start_time >= NOW() - INTERVAL '30 days'
        AND is_gap = false
    `;

    const avgResult = await query(avgQuery, [userId]);

    // Gap fill rate
    const gapQuery = `
      SELECT
        COUNT(CASE WHEN is_gap = false AND client_id IS NOT NULL THEN 1 END) as filled,
        COUNT(CASE WHEN is_gap = true THEN 1 END) as gaps
      FROM appointments
      WHERE user_id = $1
    `;

    const gapResult = await query(gapQuery, [userId]);

    res.json({
      totalClients: parseInt(clientsResult.rows[0].total),
      totalAppointments: parseInt(appointmentsResult.rows[0].total),
      appointmentsByStatus: statusResult.rows,
      appointmentsByDate: dailyResult.rows,
      avgAppointmentsPerDay: parseFloat(avgResult.rows[0].avg_per_day) || 0,
      gapStats: gapResult.rows[0],
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};
