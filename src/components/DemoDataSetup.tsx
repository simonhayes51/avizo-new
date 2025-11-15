import { useState } from 'react';
import { Calendar, Zap, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DemoDataSetup() {
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('driving_instructor');

  const setupDemo = async () => {
    if (!businessName) {
      alert('Please enter a business name');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: `demo+${Date.now()}@avizo.app`,
      password: 'demo-password-' + Date.now(),
    });

    if (signUpError || !data.user) {
      console.error('Error creating demo user:', signUpError);
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    await supabase.from('profiles').insert({
      id: userId,
      business_name: businessName,
      business_type: businessType,
      phone_number: '+44 7700 900000',
      timezone: 'Europe/London',
    });

    const clientsData = [
      { name: 'Sarah Thompson', phone_number: '+44 7700 900001', email: 'sarah@example.com', tags: ['learner', 'theory-passed'] },
      { name: 'James Wilson', phone_number: '+44 7700 900002', email: 'james@example.com', tags: ['experienced'] },
      { name: 'Emma Brown', phone_number: '+44 7700 900003', email: 'emma@example.com', tags: ['test-ready'] },
      { name: 'Michael Davies', phone_number: '+44 7700 900004', email: 'michael@example.com', tags: ['beginner'] },
    ];

    const { data: clients } = await supabase
      .from('clients')
      .insert(
        clientsData.map((client) => ({
          ...client,
          user_id: userId,
        }))
      )
      .select();

    if (!clients) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const appointmentsData = [
      {
        client_id: clients[0].id,
        title: 'Driving Lesson',
        start_time: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
        location: '123 High Street, London',
        status: 'scheduled',
        is_gap: false,
      },
      {
        client_id: null,
        title: 'Available Slot',
        start_time: new Date(today.setHours(10, 30, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
        location: '',
        status: 'scheduled',
        is_gap: true,
      },
      {
        client_id: clients[1].id,
        title: 'Driving Lesson',
        start_time: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(15, 0, 0, 0)).toISOString(),
        location: '456 Main Road, London',
        status: 'scheduled',
        is_gap: false,
      },
      {
        client_id: clients[2].id,
        title: 'Mock Test',
        start_time: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
        end_time: new Date(today.setHours(17, 30, 0, 0)).toISOString(),
        location: 'Test Centre',
        status: 'scheduled',
        is_gap: false,
      },
    ];

    await supabase.from('appointments').insert(
      appointmentsData.map((apt) => ({
        ...apt,
        user_id: userId,
      }))
    );

    const conversationData = await supabase
      .from('conversations')
      .insert([
        { user_id: userId, client_id: clients[0].id },
        { user_id: userId, client_id: clients[1].id },
      ])
      .select();

    if (conversationData.data) {
      await supabase.from('messages').insert([
        {
          conversation_id: conversationData.data[0].id,
          sender_type: 'business',
          content: 'Hi Sarah! Looking forward to our lesson tomorrow at 9am.',
          message_type: 'sms',
        },
        {
          conversation_id: conversationData.data[0].id,
          sender_type: 'client',
          content: 'Thanks! See you then.',
          message_type: 'sms',
        },
      ]);
    }

    await supabase.from('automations').insert([
      {
        user_id: userId,
        name: '24h Reminder',
        trigger_type: 'before_appointment',
        trigger_offset_hours: -24,
        message_template:
          'Hi {{client_name}}, this is a reminder about your {{appointment_title}} tomorrow at {{time}}. See you then!',
        is_active: true,
      },
      {
        user_id: userId,
        name: 'Thank You Message',
        trigger_type: 'after_appointment',
        trigger_offset_hours: 2,
        message_template:
          'Thanks for your {{appointment_title}} today {{client_name}}! Hope to see you again soon.',
        is_active: true,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Calendar className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-slate-900">Avizo</h1>
          </div>
          <p className="text-xl text-slate-600">
            Your diary's best friend. Less admin, fewer no-shows, gaps filled faster.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Clock className="w-8 h-8 text-blue-600" />}
            title="Today's Timeline"
            description="See all your appointments in one clean view with gaps highlighted"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
            title="All Messages"
            description="Every client conversation in one place, no app switching"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-600" />}
            title="Smart Automations"
            description="Reminders, follow-ups, and review requests sent automatically"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Get Started with Demo</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Sarah's Driving School"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              >
                <option value="driving_instructor">Driving Instructor</option>
                <option value="hairdresser">Hairdresser / Barber</option>
                <option value="beauty">Beauty Therapist</option>
                <option value="therapist">Therapist / Coach</option>
                <option value="trades">Trades</option>
                <option value="fitness">Fitness / Personal Trainer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={setupDemo}
            disabled={loading || !businessName}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {loading ? 'Setting up your demo...' : 'Create Demo Account'}
          </button>

          <p className="text-sm text-slate-500 mt-4 text-center">
            This will create a demo account with sample appointments, clients, and conversations
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
