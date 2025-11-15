/*
  # Avizo Database Schema

  ## Overview
  Complete schema for Avizo - appointment management and client communication platform

  ## New Tables
  
  ### `profiles`
  User/business owner profiles
  - `id` (uuid, primary key, references auth.users)
  - `business_name` (text) - e.g., "Sarah's Driving School"
  - `business_type` (text) - e.g., "driving_instructor", "hairdresser", "therapist"
  - `phone_number` (text) - for SMS integration
  - `timezone` (text) - default 'Europe/London'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `clients`
  End customers/clients
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles) - which business owner this client belongs to
  - `name` (text) - client full name
  - `phone_number` (text) - primary contact
  - `email` (text, optional)
  - `notes` (text) - general notes about client
  - `tags` (text array) - e.g., ["learner", "theory-passed"]
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `appointments`
  Individual appointments/sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `client_id` (uuid, references clients)
  - `title` (text) - e.g., "Driving Lesson", "Haircut & Color"
  - `start_time` (timestamptz)
  - `end_time` (timestamptz)
  - `status` (text) - 'scheduled', 'completed', 'cancelled', 'no_show'
  - `location` (text) - address or pickup point
  - `notes` (text)
  - `external_id` (text) - ID from integrated diary system
  - `is_gap` (boolean) - whether this is an available slot to fill
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `conversations`
  Message threads with clients
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `client_id` (uuid, references clients)
  - `last_message_at` (timestamptz)
  - `unread_count` (integer) - unread messages from client
  - `created_at` (timestamptz)

  ### `messages`
  Individual messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references conversations)
  - `sender_type` (text) - 'business' or 'client'
  - `content` (text)
  - `status` (text) - 'sent', 'delivered', 'read', 'failed'
  - `message_type` (text) - 'sms', 'whatsapp'
  - `sent_at` (timestamptz)
  - `created_at` (timestamptz)

  ### `automations`
  Automation rules and templates
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text) - e.g., "24h Reminder"
  - `trigger_type` (text) - 'before_appointment', 'after_appointment', 'cancellation', 'custom'
  - `trigger_offset_hours` (integer) - e.g., -24 for 24 hours before
  - `message_template` (text) - message content with variables
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `automation_logs`
  Track automation executions
  - `id` (uuid, primary key)
  - `automation_id` (uuid, references automations)
  - `appointment_id` (uuid, references appointments, optional)
  - `client_id` (uuid, references clients)
  - `executed_at` (timestamptz)
  - `status` (text) - 'success', 'failed', 'skipped'
  - `error_message` (text, optional)

  ### `integrations`
  Connected diary/booking systems
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `provider` (text) - e.g., "google_calendar", "acuity", "calendly"
  - `credentials` (jsonb) - encrypted credentials
  - `is_active` (boolean)
  - `last_synced_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies ensure users can only access their own data and their clients' data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL DEFAULT 'general',
  phone_number text,
  timezone text NOT NULL DEFAULT 'Europe/London',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  email text,
  notes text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  location text DEFAULT '',
  notes text DEFAULT '',
  external_id text,
  is_gap boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, client_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  message_type text NOT NULL DEFAULT 'sms',
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL,
  trigger_offset_hours integer DEFAULT 0,
  message_template text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations"
  ON automations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automations"
  ON automations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations"
  ON automations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations"
  ON automations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  executed_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'success',
  error_message text
);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation logs"
  ON automation_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM automations
      WHERE automations.id = automation_logs.automation_id
      AND automations.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL,
  credentials jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_appointments_user_start ON appointments(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, last_message_at DESC);