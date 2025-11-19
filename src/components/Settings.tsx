import { useState, useEffect } from 'react';
import { Save, Link2, Calendar as CalendarIcon, Phone, Building2, Moon, Sun, Globe, Bell, Eye, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import api from '../lib/api';
import IntegrationsSettings from './IntegrationsSettings';
import Tooltip, { HelpButton } from './Tooltip';
import { useToast } from './Toast';
import { useSettings } from '../contexts/SettingsContext';
import { Profile, UserPreferences } from '../types';

interface Integration {
  id: string;
  provider: string;
  is_active: boolean;
  last_synced_at: string | null;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { preferences, updatePreferences, refreshProfile } = useSettings();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

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
        currency: profile.currency,
      });

      await refreshProfile();
      showToast('Business profile saved successfully', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!localPreferences) return;

    setSaving(true);

    try {
      await updatePreferences(localPreferences);
      showToast('Preferences saved successfully', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast('Failed to save preferences. Please try again.', 'error');
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
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Preferences
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

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                Currency
                <Tooltip content="Set your preferred currency for payments and invoices" />
              </label>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <select
                  value={profile?.currency || 'GBP'}
                  onChange={(e) =>
                    setProfile(profile ? { ...profile, currency: e.target.value } : null)
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="GBP">£ British Pound (GBP)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="CAD">$ Canadian Dollar (CAD)</option>
                  <option value="AUD">$ Australian Dollar (AUD)</option>
                  <option value="JPY">¥ Japanese Yen (JPY)</option>
                  <option value="CHF">Fr Swiss Franc (CHF)</option>
                  <option value="INR">₹ Indian Rupee (INR)</option>
                </select>
              </div>
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

      {/* Preferences Tab */}
      {activeTab === 'preferences' && localPreferences && (
        <section className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">User Preferences</h2>
          </div>

          <div className="space-y-8">
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Appearance
              </h3>
              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Dark Mode</label>
                    <Tooltip content="Switch between light and dark theme" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({ ...localPreferences, dark_mode: !localPreferences.dark_mode })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.dark_mode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.dark_mode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Compact View</label>
                    <Tooltip content="Use a more compact layout to show more information" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({ ...localPreferences, compact_view: !localPreferences.compact_view })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.compact_view ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.compact_view ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Show Avatars</label>
                    <Tooltip content="Display user avatars throughout the interface" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({ ...localPreferences, show_avatars: !localPreferences.show_avatars })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.show_avatars ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.show_avatars ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Localization */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Localization
              </h3>
              <div className="space-y-4 pl-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    Language
                    <Tooltip content="Select your preferred language for the interface" />
                  </label>
                  <select
                    value={localPreferences.language}
                    onChange={(e) =>
                      setLocalPreferences({ ...localPreferences, language: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    Date Format
                    <Tooltip content="Choose how dates are displayed throughout the app" />
                  </label>
                  <select
                    value={localPreferences.date_format}
                    onChange={(e) =>
                      setLocalPreferences({ ...localPreferences, date_format: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    Time Format
                    <Tooltip content="Choose between 12-hour or 24-hour time format" />
                  </label>
                  <select
                    value={localPreferences.time_format}
                    onChange={(e) =>
                      setLocalPreferences({ ...localPreferences, time_format: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="12h">12 Hour (2:30 PM)</option>
                    <option value="24h">24 Hour (14:30)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    Start of Week
                    <Tooltip content="Select which day starts the week in calendars" />
                  </label>
                  <select
                    value={localPreferences.start_of_week}
                    onChange={(e) =>
                      setLocalPreferences({ ...localPreferences, start_of_week: parseInt(e.target.value) as any })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Monday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              <div className="space-y-4 pl-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Enable Notifications</label>
                    <Tooltip content="Master toggle for all notifications" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({
                        ...localPreferences,
                        notifications_enabled: !localPreferences.notifications_enabled,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.notifications_enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Email Notifications</label>
                    <Tooltip content="Receive notifications via email" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({
                        ...localPreferences,
                        email_notifications: !localPreferences.email_notifications,
                      })
                    }
                    disabled={!localPreferences.notifications_enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.email_notifications && localPreferences.notifications_enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.email_notifications && localPreferences.notifications_enabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">SMS Notifications</label>
                    <Tooltip content="Receive notifications via SMS" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({
                        ...localPreferences,
                        sms_notifications: !localPreferences.sms_notifications,
                      })
                    }
                    disabled={!localPreferences.notifications_enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.sms_notifications && localPreferences.notifications_enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.sms_notifications && localPreferences.notifications_enabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Sound Enabled</label>
                    <Tooltip content="Play sound for notifications" />
                  </div>
                  <button
                    onClick={() =>
                      setLocalPreferences({ ...localPreferences, sound_enabled: !localPreferences.sound_enabled })
                    }
                    disabled={!localPreferences.notifications_enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localPreferences.sound_enabled && localPreferences.notifications_enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localPreferences.sound_enabled && localPreferences.notifications_enabled
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Display Options
              </h3>
              <div className="space-y-4 pl-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    Items Per Page
                    <Tooltip content="Number of items to show in lists and tables" />
                  </label>
                  <select
                    value={localPreferences.items_per_page}
                    onChange={(e) =>
                      setLocalPreferences({ ...localPreferences, items_per_page: parseInt(e.target.value) as any })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
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
