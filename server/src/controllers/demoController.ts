import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const setupDemoData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Create demo clients
    const clients = [
      { name: 'Emma Thompson', phone: '+44 7700 900001', email: 'emma@example.com' },
      { name: 'James Wilson', phone: '+44 7700 900002', email: 'james@example.com' },
      { name: 'Sarah Davis', phone: '+44 7700 900003', email: 'sarah@example.com' },
      { name: 'Michael Brown', phone: '+44 7700 900004', email: 'michael@example.com' },
    ];

    const createdClients = [];
    for (const client of clients) {
      const result = await query(
        `INSERT INTO clients (user_id, name, phone_number, email, tags)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, client.name, client.phone, client.email, ['learner']]
      );
      createdClients.push(result.rows[0]);
    }

    // Create demo appointments
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const appointments = [
      {
        clientId: createdClients[0].id,
        title: 'Driving Lesson',
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        location: 'Pickup: 123 Main St',
        isGap: false,
      },
      {
        clientId: null,
        title: 'Available Slot',
        startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        endTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        location: '',
        isGap: true,
      },
      {
        clientId: createdClients[1].id,
        title: 'Driving Lesson',
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM
        location: 'Pickup: 456 Oak Ave',
        isGap: false,
      },
      {
        clientId: createdClients[2].id,
        title: 'Driving Lesson',
        startTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4 PM
        endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        location: 'Pickup: 789 Pine Rd',
        isGap: false,
      },
    ];

    for (const apt of appointments) {
      await query(
        `INSERT INTO appointments (user_id, client_id, title, start_time, end_time, location, is_gap, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, apt.clientId, apt.title, apt.startTime, apt.endTime, apt.location, apt.isGap, 'scheduled']
      );
    }

    // Create conversations and messages
    for (let i = 0; i < 3; i++) {
      const convResult = await query(
        `INSERT INTO conversations (user_id, client_id)
         VALUES ($1, $2)
         RETURNING id`,
        [userId, createdClients[i].id]
      );

      const conversationId = convResult.rows[0].id;

      // Add some demo messages
      await query(
        `INSERT INTO messages (conversation_id, sender_type, content, status)
         VALUES ($1, 'business', 'Hi ${createdClients[i].name.split(' ')[0]}, your lesson is confirmed for today!', 'delivered')`,
        [conversationId]
      );

      await query(
        `INSERT INTO messages (conversation_id, sender_type, content, status)
         VALUES ($1, 'client', 'Great, see you then!', 'read')`,
        [conversationId]
      );
    }

    // Create demo automations
    const automations = [
      {
        name: '24h Reminder',
        triggerType: 'before_appointment',
        triggerOffsetHours: -24,
        messageTemplate: 'Hi {{client_name}}, reminder about your {{appointment_title}} tomorrow at {{appointment_time}}.',
      },
      {
        name: 'Thank You Message',
        triggerType: 'after_appointment',
        triggerOffsetHours: 2,
        messageTemplate: 'Thanks for your lesson today {{client_name}}! See you next time.',
      },
    ];

    for (const automation of automations) {
      await query(
        `INSERT INTO automations (user_id, name, trigger_type, trigger_offset_hours, message_template, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [userId, automation.name, automation.triggerType, automation.triggerOffsetHours, automation.messageTemplate]
      );
    }

    res.json({ success: true, message: 'Demo data created successfully' });
  } catch (error) {
    console.error('Setup demo data error:', error);
    res.status(500).json({ error: 'Failed to setup demo data' });
  }
};
