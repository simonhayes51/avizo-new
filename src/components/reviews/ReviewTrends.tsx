import { useState, useEffect } from 'react';
import { TrendingUp, Star } from 'lucide-react';
import api from '../../lib/api';
import { ReviewTrend } from '../../types';
import { format, parseISO } from 'date-fns';

interface ReviewTrendsProps {
  platformId?: string;
  days?: number;
}

export default function ReviewTrends({ platformId, days = 30 }: ReviewTrendsProps) {
  const [trends, setTrends] = useState<ReviewTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, [platformId, days]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const params: any = { days };
      if (platformId) {
        params.platform_id = platformId;
      }

      const data = await api.reviews.getTrends(params);
      setTrends(data || []);
    } catch (error) {
      console.error('Error loading trends:', error);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Review Trends</h3>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p>No trend data available for the selected period</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...trends.map((t) => t.count));
  const maxRating = 5;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Review Trends</h3>
        </div>
        <p className="text-sm text-gray-600">Last {days} days</p>
      </div>

      {/* Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Date</span>
          <div className="flex items-center space-x-8">
            <span>Reviews</span>
            <span>Avg Rating</span>
          </div>
        </div>

        {trends
          .slice()
          .reverse()
          .map((trend, index) => (
            <div key={index} className="flex items-center space-x-3 group">
              {/* Date */}
              <div className="w-24 text-sm text-gray-600">
                {format(parseISO(trend.date), 'MMM d')}
              </div>

              {/* Review Count Bar */}
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300 group-hover:bg-blue-600 flex items-center justify-end pr-2"
                    style={{ width: `${(trend.count / maxCount) * 100}%` }}
                  >
                    {trend.count > 0 && (
                      <span className="text-xs font-medium text-white">{trend.count}</span>
                    )}
                  </div>
                </div>

                {/* Average Rating */}
                <div className="w-32 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(trend.average_rating / maxRating) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {trend.average_rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Review Count</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span className="text-gray-600">Average Rating</span>
        </div>
      </div>
    </div>
  );
}
