export interface Appointment {
  id: string;
  user_id: string;
  client_id: string | null;
  client?: Client;
  title: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  location: string;
  notes: string;
  external_id: string | null;
  is_gap: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email: string | null;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'business' | 'client';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  message_type: 'sms' | 'whatsapp';
  sent_at: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  client_id: string;
  client?: Client;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  messages?: Message[];
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  trigger_type: string;
  trigger_offset_hours: number;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
