import { useState, useEffect } from 'react';
import { Save, Link2, Calendar as CalendarIcon, Phone, Building2 } from 'lucide-react';
import api from '../lib/api';

interface Profile {
  id: string;
  business_name: string;
  business_type: string;
  phone_number: string | null;
  timezone: string;
}

interface Integration {
  id: string;
  provider: string;
  is_active: boolean;
  last_synced_at: string | null;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profileData = await api.auth.getProfile();
      const integrationsData = await api.integrations.getAll();

      setProfile(profileData);
      setIntegrations(integrationsData || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      setProfile(null);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);

    try {
      await api.auth.updateProfile({
        business_name: profile.business_name,
        business_type: profile.business_type,
        phone_number: profile.phone_number,
        timezone: profile.timezone,
      });

      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

      <div className="space-y-6">
        <section className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">Business Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={profile?.business_name || ''}
                onChange={(e) =>
                  setProfile(profile ? { ...profile, business_name: e.target.value } : null)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Type
              </label>
              <select
                value={profile?.business_type || 'general'}
                onChange={(e) =>
                  setProfile(profile ? { ...profile, business_type: e.target.value } : null)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="driving_instructor">Driving Instructor</option>
                <option value="hairdresser">Hairdresser / Barber</option>
                <option value="beauty">Beauty Therapist</option>
                <option value="therapist">Therapist / Coach</option>
                <option value="trades">Trades (Plumber, Electrician, etc.)</option>
                <option value="fitness">Fitness / Personal Trainer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={profile?.phone_number || ''}
                  onChange={(e) =>
                    setProfile(profile ? { ...profile, phone_number: e.target.value } : null)
                  }
                  placeholder="+44 7700 900000"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timezone
              </label>
              <select
                value={profile?.timezone || 'Europe/London'}
                onChange={(e) =>
                  setProfile(profile ? { ...profile, timezone: e.target.value } : null)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Link2 className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">Integrations</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Connect your existing diary or booking system to automatically sync appointments to Avizo.
          </p>

          <div className="space-y-3">
            <IntegrationCard
              name="Google Calendar"
              description="Sync appointments from Google Calendar"
              icon={<CalendarIcon className="w-6 h-6 text-blue-600" />}
              connected={integrations.some((i) => i.provider === 'google_calendar' && i.is_active)}
              onConnect={() => alert('Google Calendar integration coming soon')}
            />

            <IntegrationCard
              name="Outlook Calendar"
              description="Sync appointments from Outlook"
              icon={<CalendarIcon className="w-6 h-6 text-blue-500" />}
              connected={integrations.some((i) => i.provider === 'outlook' && i.is_active)}
              onConnect={() => alert('Outlook integration coming soon')}
            />

            <IntegrationCard
              name="Acuity Scheduling"
              description="Import bookings from Acuity"
              icon={<CalendarIcon className="w-6 h-6 text-teal-600" />}
              connected={integrations.some((i) => i.provider === 'acuity' && i.is_active)}
              onConnect={() => alert('Acuity integration coming soon')}
            />

            <IntegrationCard
              name="Calendly"
              description="Import bookings from Calendly"
              icon={<CalendarIcon className="w-6 h-6 text-blue-700" />}
              connected={integrations.some((i) => i.provider === 'calendly' && i.is_active)}
              onConnect={() => alert('Calendly integration coming soon')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
}

function IntegrationCard({ name, description, icon, connected, onConnect }: IntegrationCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>

      {connected ? (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Connected
        </span>
      ) : (
        <button
          onClick={onConnect}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors font-medium"
        >
          Connect
        </button>
      )}
    </div>
  );
}
