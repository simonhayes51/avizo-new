import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string;
          business_type: string;
          phone_number: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone_number: string;
          email: string | null;
          notes: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
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
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          last_message_at: string;
          unread_count: number;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: 'business' | 'client';
          content: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          message_type: 'sms' | 'whatsapp';
          sent_at: string;
          created_at: string;
        };
      };
      automations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          trigger_type: string;
          trigger_offset_hours: number;
          message_template: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
