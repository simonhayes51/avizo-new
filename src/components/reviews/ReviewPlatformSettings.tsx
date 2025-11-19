import { useState } from 'react';
import { X, Plus, Trash2, ExternalLink, AlertCircle, Check, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import { ReviewPlatform } from '../../types';

interface ReviewPlatformSettingsProps {
  platforms: ReviewPlatform[];
  onClose: () => void;
}

export default function ReviewPlatformSettings({ platforms, onClose }: ReviewPlatformSettingsProps) {
  const [editingPlatform, setEditingPlatform] = useState<ReviewPlatform | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    platform_name: '',
    platform_url: '',
    api_key: '',
    place_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const popularPlatforms = [
    { name: 'Google Reviews', icon: '🔍', placeholder_url: 'https://www.google.com/maps/place/...' },
    { name: 'Yelp', icon: '⭐', placeholder_url: 'https://www.yelp.com/biz/...' },
    { name: 'Facebook', icon: '👥', placeholder_url: 'https://www.facebook.com/...' },
    { name: 'Trustpilot', icon: '🛡️', placeholder_url: 'https://www.trustpilot.com/review/...' },
    { name: 'TripAdvisor', icon: '🦉', placeholder_url: 'https://www.tripadvisor.com/...' },
  ];

  const handleAddPlatform = async () => {
    if (!formData.platform_name.trim()) {
      setError('Platform name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.reviews.addPlatform(formData);
      setSuccess('Platform added successfully!');
      setFormData({ platform_name: '', platform_url: '', api_key: '', place_id: '' });
      setShowAddForm(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to add platform');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlatform = async (platformId: string) => {
    if (!confirm('Are you sure you want to delete this platform? This will also remove all associated reviews.')) {
      return;
    }

    try {
      await api.reviews.deletePlatform(platformId);
      setSuccess('Platform deleted successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to delete platform');
    }
  };

  const handleToggleActive = async (platform: ReviewPlatform) => {
    try {
      await api.reviews.updatePlatform(platform.id, {
        is_active: !platform.is_active,
      });
      setSuccess('Platform updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Failed to update platform');
    }
  };

  const handleGenerateSamples = async (platformId: string) => {
    try {
      setSaving(true);
      await api.reviews.generateSamples(platformId, 20);
      setSuccess('Sample reviews generated! Refresh the page to see them.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to generate samples');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Review Platform Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Current Platforms */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Platforms</h3>

            {platforms.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No platforms configured yet. Add your first platform below!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-base font-medium text-gray-900">{platform.platform_name}</h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            platform.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {platform.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {platform.platform_url && (
                        <a
                          href={platform.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>{platform.platform_url}</span>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGenerateSamples(platform.id)}
                        className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        disabled={saving}
                      >
                        Generate Samples
                      </button>
                      <button
                        onClick={() => handleToggleActive(platform)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          platform.is_active
                            ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            : 'text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {platform.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeletePlatform(platform.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Platform */}
          {!showAddForm ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Platform</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {popularPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        platform_name: platform.name,
                        platform_url: platform.placeholder_url,
                      });
                      setShowAddForm(true);
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{platform.name}</p>
                  </button>
                ))}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center"
                >
                  <Plus className="h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Custom Platform</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Platform Details</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ platform_name: '', platform_url: '', api_key: '', place_id: '' });
                    setError('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Name *
                  </label>
                  <input
                    type="text"
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Google Reviews"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform URL
                  </label>
                  <input
                    type="url"
                    value={formData.platform_url}
                    onChange={(e) => setFormData({ ...formData, platform_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      API Key (Optional)
                    </label>
                    <a
                      href="https://github.com/simonhayes51/avizo-new/blob/main/docs/REVIEW_API_SETUP.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>How to get API key</span>
                    </a>
                  </div>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="For automated review sync"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for automatic review syncing
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Place ID (Optional)
                    </label>
                    <a
                      href="https://github.com/simonhayes51/avizo-new/blob/main/docs/REVIEW_API_SETUP.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>How to find Place ID</span>
                    </a>
                  </div>
                  <input
                    type="text"
                    value={formData.place_id}
                    onChange={(e) => setFormData({ ...formData, place_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Platform-specific identifier"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your business ID on the review platform
                  </p>
                </div>

                <button
                  onClick={handleAddPlatform}
                  disabled={saving || !formData.platform_name.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add Platform'}
                </button>
              </div>
            </div>
          )}

          {/* API Setup Instructions */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Need Help Setting Up APIs?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    We've created step-by-step guides for connecting each review platform.
                  </p>
                  <a
                    href="https://github.com/simonhayes51/avizo-new/blob/main/docs/REVIEW_API_SETUP.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>View Complete Setup Guide</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Quick Start Options:</p>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">1.</span>
                      <span><strong>No API yet?</strong> Use "Generate Samples" to test with demo data</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">2.</span>
                      <span><strong>Have API keys?</strong> Add them above for automatic syncing</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold">3.</span>
                      <span><strong>Manual entry:</strong> Add platforms without API keys and copy/paste reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📋 Supported Platforms:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Google Reviews (API ready)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Facebook (API ready)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Trustpilot (API ready)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Yelp (read-only)</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>TripAdvisor (coming soon)</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>Custom platforms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
