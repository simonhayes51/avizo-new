import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences, Profile } from '../types';
import api from '../lib/api';

interface SettingsContextType {
  preferences: UserPreferences;
  profile: Profile | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const defaultPreferences: UserPreferences = {
  dark_mode: false,
  language: 'en',
  date_format: 'DD/MM/YYYY',
  time_format: '12h',
  start_of_week: 1,
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: true,
  sound_enabled: true,
  compact_view: false,
  show_avatars: true,
  items_per_page: 25,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const profileData = await api.auth.getProfile();
      setProfile(profileData);

      // Set preferences from profile, or use defaults
      if (profileData.preferences) {
        setPreferences({ ...defaultPreferences, ...profileData.preferences });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (preferences.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.dark_mode]);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    try {
      await api.auth.updateProfile({ preferences: updated });
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setPreferences(preferences);
      throw error;
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        profile,
        updatePreferences,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
