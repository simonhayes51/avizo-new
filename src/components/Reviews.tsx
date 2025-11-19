import { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Minus, AlertCircle, MessageSquare, Filter, Plus, Settings } from 'lucide-react';
import api from '../lib/api';
import { Review, ReviewPlatform, ReviewStats } from '../types';
import ReviewList from './reviews/ReviewList';
import ReviewTrends from './reviews/ReviewTrends';
import ReviewPlatformSettings from './reviews/ReviewPlatformSettings';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterReplied, setFilterReplied] = useState<string>('all');
  const [showPlatformSettings, setShowPlatformSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedPlatform, filterRating, filterReplied]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Build filter params
      const params: any = {};
      if (selectedPlatform !== 'all') {
        params.platform_id = selectedPlatform;
      }
      if (filterRating !== 'all') {
        if (filterRating === 'negative') {
          params.max_rating = 2.9;
        } else if (filterRating === 'neutral') {
          params.min_rating = 3;
          params.max_rating = 3.9;
        } else if (filterRating === 'positive') {
          params.min_rating = 4;
        }
      }
      if (filterReplied !== 'all') {
        params.is_replied = filterReplied === 'replied';
      }

      const [reviewsData, platformsData, statsData] = await Promise.all([
        api.reviews.getAll(params),
        api.reviews.getPlatforms(),
        api.reviews.getStats(
          selectedPlatform !== 'all' ? { platform_id: selectedPlatform } : {}
        ),
      ]);

      setReviews(reviewsData || []);
      setPlatforms(platformsData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToReview = async (reviewId: string, replyText: string) => {
    try {
      await api.reviews.update(reviewId, { reply_text: replyText });
      await loadData();
    } catch (error) {
      console.error('Error replying to review:', error);
      alert('Failed to save reply');
    }
  };

  const handleToggleFlag = async (reviewId: string, isFlagged: boolean) => {
    try {
      await api.reviews.update(reviewId, { is_flagged: !isFlagged });
      await loadData();
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const handleMarkAsRead = async (reviewId: string) => {
    try {
      await api.reviews.update(reviewId, { is_read: true });
      await loadData();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getTrendIcon = () => {
    if (!stats) return null;
    if (stats.recent_trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (stats.recent_trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-1">Monitor and respond to customer reviews</p>
        </div>
        <button
          onClick={() => setShowPlatformSettings(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Settings className="h-5 w-5" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Average Rating */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              {getTrendIcon()}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-3xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</p>
              {renderStars(Math.round(stats.average_rating))}
            </div>
            {stats.change_percentage !== 0 && (
              <p className={`text-sm mt-2 ${stats.recent_trend === 'up' ? 'text-green-600' : stats.recent_trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {stats.change_percentage > 0 ? '+' : ''}{stats.change_percentage.toFixed(1)}% from last period
              </p>
            )}
          </div>

          {/* Total Reviews */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_reviews}</p>
            <div className="mt-2 space-y-1">
              {Object.entries(stats.rating_distribution).reverse().map(([rating, count]) => (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600 w-4">{rating}⭐</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(Number(count) / stats.total_reviews) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Replies */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Needs Reply</p>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending_replies}</p>
            <p className="text-sm text-gray-600 mt-2">
              Reviews awaiting response
            </p>
          </div>

          {/* Negative Reviews */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Negative Reviews</p>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.negative_reviews}</p>
            <p className="text-sm text-gray-600 mt-2">
              {stats.total_reviews > 0
                ? `${((stats.negative_reviews / stats.total_reviews) * 100).toFixed(1)}% of total`
                : '0% of total'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.platform_name}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="positive">Positive (4-5⭐)</option>
            <option value="neutral">Neutral (3⭐)</option>
            <option value="negative">Negative (1-2⭐)</option>
          </select>

          {/* Reply Status Filter */}
          <select
            value={filterReplied}
            onChange={(e) => setFilterReplied(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Reviews</option>
            <option value="replied">Replied</option>
            <option value="unreplied">Needs Reply</option>
          </select>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="mb-6">
        <ReviewTrends platformId={selectedPlatform !== 'all' ? selectedPlatform : undefined} />
      </div>

      {/* Reviews List */}
      <ReviewList
        reviews={reviews}
        onReply={handleReplyToReview}
        onToggleFlag={handleToggleFlag}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* Platform Settings Modal */}
      {showPlatformSettings && (
        <ReviewPlatformSettings
          platforms={platforms}
          onClose={() => {
            setShowPlatformSettings(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
