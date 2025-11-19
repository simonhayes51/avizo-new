import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Sparkles, Users, Calendar, DollarSign, Target, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Insight {
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  action?: string;
  actionRoute?: string;
  metric?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface AIInsightsProps {
  clients: any[];
  appointments: any[];
}

export default function AIInsights({ clients, appointments }: AIInsightsProps) {
  const navigate = useNavigate();

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const now = new Date();

    // Revenue Analysis
    const completedApts = appointments.filter(apt => apt.status === 'completed');
    const thisMonth = completedApts.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    });

    const lastMonth = completedApts.filter(apt => {
      const aptDate = new Date(apt.start_time);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return aptDate.getMonth() === lastMonthDate.getMonth() && aptDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthRevenue = thisMonth.reduce((sum, apt) => sum + (apt.price || 0), 0);
    const lastMonthRevenue = lastMonth.reduce((sum, apt) => sum + (apt.price || 0), 0);

    if (thisMonthRevenue > lastMonthRevenue && lastMonthRevenue > 0) {
      const growth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(0);
      insights.push({
        type: 'success',
        title: 'Revenue Growing',
        description: `Your revenue is up ${growth}% compared to last month`,
        metric: `+${growth}%`,
        trend: 'up',
      });
    } else if (thisMonthRevenue < lastMonthRevenue && lastMonthRevenue > 0) {
      const decline = ((lastMonthRevenue - thisMonthRevenue) / lastMonthRevenue * 100).toFixed(0);
      insights.push({
        type: 'warning',
        title: 'Revenue Declining',
        description: `Revenue is down ${decline}% from last month. Consider running a promotion`,
        metric: `-${decline}%`,
        trend: 'down',
        action: 'Create Campaign',
        actionRoute: '/app/marketing',
      });
    }

    // Client Retention Analysis
    const overdueClients = clients.filter(client => {
      const clientApts = appointments.filter(apt => apt.client?.id === client.id && apt.status === 'completed');
      if (clientApts.length === 0) return false;

      const lastApt = new Date(Math.max(...clientApts.map(apt => new Date(apt.end_time).getTime())));
      const daysSince = Math.floor((now.getTime() - lastApt.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 30;
    });

    if (overdueClients.length > 0) {
      insights.push({
        type: 'alert',
        title: 'Clients Need Follow-Up',
        description: `${overdueClients.length} client${overdueClients.length > 1 ? 's haven\'t' : ' hasn\'t'} booked in 30+ days`,
        metric: `${overdueClients.length}`,
        action: 'Contact Clients',
        actionRoute: '/app/clients',
      });
    }

    // Schedule Optimization
    const gaps = appointments.filter(apt => apt.is_gap);
    const upcomingGaps = gaps.filter(apt => new Date(apt.start_time) > now);

    if (upcomingGaps.length > 0) {
      insights.push({
        type: 'info',
        title: 'Schedule Gaps Detected',
        description: `You have ${upcomingGaps.length} unfilled slot${upcomingGaps.length > 1 ? 's' : ''} this week`,
        metric: `${upcomingGaps.length}`,
        action: 'Fill Gaps',
        actionRoute: '/app/dashboard',
      });
    }

    // Booking Rate Analysis
    const last7Days = appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      const daysDiff = (now.getTime() - aptDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7 && daysDiff >= 0 && !apt.is_gap;
    });

    if (last7Days.length < 3 && clients.length > 10) {
      insights.push({
        type: 'warning',
        title: 'Low Booking Activity',
        description: 'Only a few bookings this week. Time to reach out to clients!',
        action: 'Send Messages',
        actionRoute: '/app/conversations',
      });
    } else if (last7Days.length > 10) {
      insights.push({
        type: 'success',
        title: 'High Demand Week',
        description: `${last7Days.length} bookings this week! Great momentum`,
        metric: `${last7Days.length}`,
        trend: 'up',
      });
    }

    // New Client Opportunities
    const newClients = clients.filter(client => {
      const clientApts = appointments.filter(apt => apt.client?.id === client.id);
      return clientApts.length === 0;
    });

    if (newClients.length > 5) {
      insights.push({
        type: 'info',
        title: 'Untapped Potential',
        description: `${newClients.length} clients haven't booked yet. Send them a welcome message`,
        metric: `${newClients.length}`,
        action: 'View Clients',
        actionRoute: '/app/clients',
      });
    }

    // If no insights, add a positive message
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Everything Looking Good',
        description: 'Your business is running smoothly. Keep up the great work!',
        trend: 'neutral',
      });
    }

    return insights.slice(0, 4); // Show max 4 insights
  };

  const insights = generateInsights();

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColors = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-500',
          border: 'border-green-200',
          text: 'text-green-700',
          iconBg: 'bg-green-100',
          iconText: 'text-green-600',
        };
      case 'warning':
        return {
          bg: 'from-amber-500 to-orange-500',
          border: 'border-amber-200',
          text: 'text-amber-700',
          iconBg: 'bg-amber-100',
          iconText: 'text-amber-600',
        };
      case 'alert':
        return {
          bg: 'from-red-500 to-rose-500',
          border: 'border-red-200',
          text: 'text-red-700',
          iconBg: 'bg-red-100',
          iconText: 'text-red-600',
        };
      case 'info':
        return {
          bg: 'from-blue-500 to-cyan-500',
          border: 'border-blue-200',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Business Insights</h2>
            <p className="text-sm text-slate-600">Smart analytics powered by AI</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          LIVE
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const colors = getColors(insight.type);

          return (
            <div
              key={index}
              className={`p-4 bg-gradient-to-r ${colors.bg} rounded-xl text-white relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => insight.actionRoute && navigate(insight.actionRoute)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              </div>

              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      {getIcon(insight.type)}
                    </div>
                    <h3 className="font-bold text-lg">{insight.title}</h3>
                  </div>

                  <p className="text-white/90 text-sm mb-3 leading-relaxed">
                    {insight.description}
                  </p>

                  {insight.action && (
                    <div className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm hover:bg-white/30 transition">
                      {insight.action}
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {insight.metric && (
                  <div className="flex flex-col items-end ml-4">
                    <div className="text-3xl font-bold mb-1">{insight.metric}</div>
                    {insight.trend && (
                      <div className="flex items-center gap-1">
                        {insight.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : insight.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : null}
                        <span className="text-xs opacity-90">
                          {insight.trend === 'up' ? 'Increasing' : insight.trend === 'down' ? 'Decreasing' : 'Stable'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
        <p className="text-xs text-purple-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>AI analyzes your business data in real-time to provide actionable insights</span>
        </p>
      </div>
    </div>
  );
}
