import { useState, useEffect } from 'react';
import { Save, Link2, Calendar as CalendarIcon, Phone, Building2 } from 'lucide-react';
import api from '../lib/api';
import IntegrationsSettings from './IntegrationsSettings';
import Tooltip, { HelpButton } from './Tooltip';
import { useToast } from './Toast';

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
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

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

    // Validation
    if (!profile.business_name.trim()) {
      showToast('Please enter a business name', 'error');
      return;
    }

    setSaving(true);

    try {
      await api.auth.updateProfile({
        business_name: profile.business_name,
        business_type: profile.business_type,
        phone_number: profile.phone_number,
        timezone: profile.timezone,
      });

      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save settings. Please try again.', 'error');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <HelpButton
          title="Settings Help"
          description={`Configure your business profile and integrations here.\n\nBusiness Profile: Update your business information, contact details, and timezone preferences.\n\nIntegrations: Connect your calendar, messaging, and video call services to streamline your workflow.`}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Business Profile
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`${
              activeTab === 'integrations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Integrations
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                Business Type
                <Tooltip content="Select your industry to customize features and templates for your business" />
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
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                Timezone
                <Tooltip content="Set your local timezone to ensure appointments display at the correct times" />
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
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <IntegrationsSettings />
      )}
    </div>
  );
}
