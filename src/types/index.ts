export interface Appointment {
  id: string;
  user_id: string;
  client_id: string | null;
  client?: Client;
  team_member_id?: string | null;
  recurring_pattern_id?: string | null;
  title: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  location: string;
  notes: string;
  external_id: string | null;
  is_gap: boolean;
  video_url?: string | null;
  video_platform?: 'zoom' | 'google_meet' | null;
  payment_status?: 'unpaid' | 'paid' | 'refunded';
  price?: number;
  calendar_synced?: boolean;
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

export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  is_active: boolean;
  last_synced_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  appointment_id?: string;
  client_id: string;
  client_name?: string;
  appointment_title?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  external_payment_id?: string;
  paid_at?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  line_items: InvoiceLineItem[];
  notes: string;
  due_date?: string;
  issued_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface RecurringPattern {
  id: string;
  user_id: string;
  client_id?: string;
  client_name?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  days_of_week?: number[];
  start_date: string;
  end_date?: string;
  title: string;
  duration_minutes: number;
  location: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitingListEntry {
  id: string;
  user_id: string;
  client_id: string;
  client_name?: string;
  phone_number?: string;
  email?: string;
  preferred_dates?: string[];
  preferred_times?: string[];
  duration_minutes: number;
  notes: string;
  priority: number;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  calendar_color: string;
  created_at: string;
  updated_at: string;
}
