import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import Tooltip, { HelpButton } from './Tooltip';

interface AnalyticsData {
  totalClients: number;
  totalAppointments: number;
  appointmentsByStatus: Array<{ status: string; count: string }>;
  appointmentsByDate: Array<{ date: string; count: string }>;
  avgAppointmentsPerDay: number;
  gapStats: {
    filled: string;
    gaps: string;
  };
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (dateRange === '7days' ? 7 : 30));
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }

      const data = await api.analytics.get(params);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  const statusData = analytics.appointmentsByStatus.reduce((acc, item) => {
    acc[item.status] = parseInt(item.count);
    return acc;
  }, {} as Record<string, number>);

  const gapFillRate = analytics.gapStats.filled && analytics.gapStats.gaps
    ? (parseInt(analytics.gapStats.filled) / (parseInt(analytics.gapStats.filled) + parseInt(analytics.gapStats.gaps))) * 100
    : 0;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics
          </h1>
          <p className="text-slate-600 mt-1">Track your business performance</p>
        </div>

        <div className="flex items-center gap-3">
          <HelpButton
            title="Analytics Help"
            description={`Track your business performance with detailed analytics.\n\nTotal Clients: Total number of clients in your database.\n\nTotal Appointments: Number of appointments in the selected time period.\n\nAvg Per Day: Average number of appointments per day.\n\nGap Fill Rate: Percentage of available appointment slots that have been filled.`}
          />
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setDateRange('7days')}
            className={`px-4 py-2 rounded-lg transition ${
              dateRange === '7days'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30days')}
            className={`px-4 py-2 rounded-lg transition ${
              dateRange === '30days'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-4 py-2 rounded-lg transition ${
              dateRange === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{analytics.totalClients}</div>
            </div>
          </div>
          <div className="text-blue-100">Total Clients</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{analytics.totalAppointments}</div>
            </div>
          </div>
          <div className="text-purple-100">Total Appointments</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{analytics.avgAppointmentsPerDay.toFixed(1)}</div>
            </div>
          </div>
          <div className="text-green-100">Avg Per Day</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">{gapFillRate.toFixed(0)}%</div>
            </div>
          </div>
          <div className="text-amber-100">Gap Fill Rate</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Appointments by Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700 font-medium">Completed</span>
                </div>
                <span className="text-slate-900 font-bold">{statusData.completed || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${analytics.totalAppointments ? (statusData.completed || 0) / analytics.totalAppointments * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700 font-medium">Scheduled</span>
                </div>
                <span className="text-slate-900 font-bold">{statusData.scheduled || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${analytics.totalAppointments ? (statusData.scheduled || 0) / analytics.totalAppointments * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-slate-700 font-medium">Cancelled</span>
                </div>
                <span className="text-slate-900 font-bold">{statusData.cancelled || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${analytics.totalAppointments ? (statusData.cancelled || 0) / analytics.totalAppointments * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-slate-700 font-medium">No Show</span>
                </div>
                <span className="text-slate-900 font-bold">{statusData.no_show || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${analytics.totalAppointments ? (statusData.no_show || 0) / analytics.totalAppointments * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.appointmentsByDate.slice(0, 10).reverse().map((item, index) => {
              const count = parseInt(item.count);
              const maxCount = Math.max(...analytics.appointmentsByDate.map(d => parseInt(d.count)));
              const percentage = (count / maxCount) * 100;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gap Statistics */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Gap Management</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {analytics.gapStats.filled}
            </div>
            <div className="text-slate-600">Slots Filled</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-600 mb-2">
              {analytics.gapStats.gaps}
            </div>
            <div className="text-slate-600">Available Slots</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {gapFillRate.toFixed(0)}%
            </div>
            <div className="text-slate-600">Fill Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
