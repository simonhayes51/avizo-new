import { useState } from 'react';
import { Mail, MessageSquare, Send, Users, TrendingUp, Eye, MousePointerClick, DollarSign, Plus, X, Calendar, Target, Zap } from 'lucide-react';
import Tooltip, { HelpButton } from './Tooltip';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  subject: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  revenue: number;
  scheduledDate?: Date;
  createdDate: Date;
}

export default function MarketingCampaigns() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaignType, setCampaignType] = useState<'email' | 'sms'>('email');

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Special Promotion',
      type: 'email',
      status: 'sent',
      subject: '☀️ Summer Special: 25% Off All Services!',
      recipients: 247,
      sent: 247,
      opened: 189,
      clicked: 67,
      revenue: 3420,
      createdDate: new Date('2025-11-10'),
    },
    {
      id: '2',
      name: 'Appointment Reminder',
      type: 'sms',
      status: 'active',
      subject: 'Your appointment is tomorrow at 2 PM',
      recipients: 45,
      sent: 45,
      opened: 45,
      clicked: 12,
      revenue: 0,
      createdDate: new Date('2025-11-16'),
    },
    {
      id: '3',
      name: 'New Year Wellness Package',
      type: 'email',
      status: 'scheduled',
      subject: '🎉 Start 2026 Right with Our Wellness Package',
      recipients: 312,
      sent: 0,
      opened: 0,
      clicked: 0,
      revenue: 0,
      scheduledDate: new Date('2025-12-28'),
      createdDate: new Date('2025-11-15'),
    },
    {
      id: '4',
      name: 'Re-engagement Campaign',
      type: 'email',
      status: 'draft',
      subject: 'We Miss You! Come Back with 30% Off',
      recipients: 89,
      sent: 0,
      opened: 0,
      clicked: 0,
      revenue: 0,
      createdDate: new Date('2025-11-17'),
    },
  ];

  const templates = [
    {
      id: '1',
      name: 'Seasonal Promotion',
      type: 'email',
      description: 'Perfect for seasonal offers and discounts',
      uses: 23,
    },
    {
      id: '2',
      name: 'Appointment Reminder',
      type: 'sms',
      description: 'Automated reminder before appointments',
      uses: 156,
    },
    {
      id: '3',
      name: 'Birthday Wishes',
      type: 'email',
      description: 'Send birthday greetings with special offer',
      uses: 45,
    },
    {
      id: '4',
      name: 'Review Request',
      type: 'email',
      description: 'Ask satisfied clients for reviews',
      uses: 67,
    },
    {
      id: '5',
      name: 'Win-Back',
      type: 'email',
      description: 'Re-engage inactive clients',
      uses: 12,
    },
  ];

  const stats = {
    totalCampaigns: campaigns.length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    avgOpenRate: (campaigns.reduce((sum, c) => sum + (c.sent > 0 ? (c.opened / c.sent) * 100 : 0), 0) / campaigns.filter(c => c.sent > 0).length) || 0,
    avgClickRate: (campaigns.reduce((sum, c) => sum + (c.opened > 0 ? (c.clicked / c.opened) * 100 : 0), 0) / campaigns.filter(c => c.opened > 0).length) || 0,
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700',
      active: 'bg-purple-100 text-purple-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Send className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Marketing Campaigns</h1>
            <p className="text-slate-600 mt-1">Engage clients with email & SMS campaigns</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <HelpButton
            title="Marketing Campaigns Help"
            description={`Create and manage email & SMS campaigns to engage your clients.\n\nEmail Campaigns: Perfect for detailed promotions, newsletters, and rich content with images and links.\n\nSMS Campaigns: Great for time-sensitive messages, appointment reminders, and quick updates.\n\nTemplates: Use pre-built templates to get started quickly.\n\nAnalytics: Track open rates, click rates, and revenue to measure campaign success.`}
          />
          <button
            onClick={() => setShowNewCampaign(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-600">Total Campaigns</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalCampaigns}</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-slate-600">Total Sent</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalSent}</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="text-sm text-slate-600 flex items-center gap-1">
              Avg Open Rate
              <Tooltip content="Percentage of recipients who opened your campaigns" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.avgOpenRate.toFixed(0)}%</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-slate-600 flex items-center gap-1">
              Avg Click Rate
              <Tooltip content="Percentage of people who clicked links after opening" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.avgClickRate.toFixed(0)}%</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-slate-600 flex items-center gap-1">
              Revenue
              <Tooltip content="Total revenue generated from campaign conversions" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'campaigns'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${campaign.type === 'email' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {campaign.type === 'email' ? (
                      <Mail className={`w-6 h-6 ${campaign.type === 'email' ? 'text-blue-600' : 'text-purple-600'}`} />
                    ) : (
                      <MessageSquare className={`w-6 h-6 ${campaign.type === 'email' ? 'text-blue-600' : 'text-purple-600'}`} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-slate-600 mb-3">{campaign.subject}</p>

                    {campaign.status === 'scheduled' && campaign.scheduledDate && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                        <Calendar className="w-4 h-4" />
                        Scheduled for {campaign.scheduledDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}

                    {campaign.sent > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-slate-600">Recipients</div>
                          <div className="text-xl font-bold text-slate-900">{campaign.recipients}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Opened</div>
                          <div className="text-xl font-bold text-green-600">
                            {campaign.opened} <span className="text-sm">({((campaign.opened / campaign.sent) * 100).toFixed(0)}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Clicked</div>
                          <div className="text-xl font-bold text-purple-600">
                            {campaign.clicked} <span className="text-sm">({campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(0) : 0}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Revenue</div>
                          <div className="text-xl font-bold text-emerald-600">${campaign.revenue}</div>
                        </div>
                      </div>
                    )}

                    {campaign.status === 'draft' && (
                      <div className="text-sm text-slate-500">
                        Draft • {campaign.recipients} recipients selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Send Now
                    </button>
                  )}
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${template.type === 'email' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                  {template.type === 'email' ? (
                    <Mail className="w-6 h-6 text-blue-600" />
                  ) : (
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                  {template.uses} uses
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">{template.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{template.description}</p>

              <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium opacity-0 group-hover:opacity-100">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Campaign Performance</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-blue-100 mb-1">Total Reach</div>
                <div className="text-3xl font-bold">{stats.totalSent}</div>
              </div>
              <div>
                <div className="text-blue-100 mb-1">Engagement Rate</div>
                <div className="text-3xl font-bold">{stats.avgOpenRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-blue-100 mb-1">Conversion Rate</div>
                <div className="text-3xl font-bold">{stats.avgClickRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-blue-100 mb-1">ROI</div>
                <div className="text-3xl font-bold">487%</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Top Performing Campaigns</h3>
              <div className="space-y-3">
                {campaigns
                  .filter(c => c.sent > 0)
                  .sort((a, b) => (b.opened / b.sent) - (a.opened / a.sent))
                  .slice(0, 5)
                  .map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-slate-900 font-medium">{campaign.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                          {((campaign.opened / campaign.sent) * 100).toFixed(0)}% open
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Revenue by Campaign</h3>
              <div className="space-y-3">
                {campaigns
                  .filter(c => c.revenue > 0)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((campaign) => {
                    const percentage = (campaign.revenue / stats.totalRevenue) * 100;
                    return (
                      <div key={campaign.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-700 font-medium">{campaign.name}</span>
                          <span className="text-sm font-bold text-emerald-600">${campaign.revenue}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">Create New Campaign</h2>
              <button
                onClick={() => setShowNewCampaign(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Campaign Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCampaignType('email')}
                    className={`p-4 border-2 rounded-xl flex items-center gap-3 transition ${
                      campaignType === 'email'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Mail className={`w-6 h-6 ${campaignType === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <div className="font-medium text-slate-900">Email Campaign</div>
                      <div className="text-xs text-slate-600">Rich content, links, images</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setCampaignType('sms')}
                    className={`p-4 border-2 rounded-xl flex items-center gap-3 transition ${
                      campaignType === 'sms'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MessageSquare className={`w-6 h-6 ${campaignType === 'sms' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <div className="font-medium text-slate-900">SMS Campaign</div>
                      <div className="text-xs text-slate-600">Quick, direct messages</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g., Spring Sale 2026"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Subject/Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {campaignType === 'email' ? 'Subject Line' : 'Message'}
                </label>
                {campaignType === 'email' ? (
                  <input
                    type="text"
                    placeholder="e.g., Get 25% Off This Weekend Only!"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div>
                    <textarea
                      placeholder="Your message here (max 160 characters)"
                      rows={4}
                      maxLength={160}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                    />
                    <div className="text-xs text-slate-500 mt-1">0 / 160 characters</div>
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
                <select className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option>All Clients (247)</option>
                  <option>VIP Clients (45)</option>
                  <option>Active Last 30 Days (189)</option>
                  <option>Inactive Clients (58)</option>
                  <option>Custom Segment...</option>
                </select>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Schedule</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 transition">
                    <input type="radio" name="schedule" defaultChecked className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-slate-900">Send Now</div>
                      <div className="text-xs text-slate-600">Send immediately</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 transition">
                    <input type="radio" name="schedule" className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-slate-900">Schedule</div>
                      <div className="text-xs text-slate-600">Pick date & time</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowNewCampaign(false)}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
