import { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Minus, AlertCircle, MessageSquare, Filter, Plus, Settings, HelpCircle } from 'lucide-react';
import api from '../lib/api';
import { Review, ReviewPlatform, ReviewStats } from '../types';
import ReviewList from './reviews/ReviewList';
import ReviewTrends from './reviews/ReviewTrends';
import ReviewPlatformSettings from './reviews/ReviewPlatformSettings';
import GettingStartedGuide from './reviews/GettingStartedGuide';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [platforms, setPlatforms] = useState<ReviewPlatform[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterReplied, setFilterReplied] = useState<string>('all');
  const [showPlatformSettings, setShowPlatformSettings] = useState(false);
  const [showGettingStarted, setShowGettingStarted] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedPlatform, filterRating, filterReplied]);

  // Auto-show getting started guide if no platforms
  useEffect(() => {
    if (!loading && platforms.length === 0 && !localStorage.getItem('reviews_guide_dismissed')) {
      setShowGettingStarted(true);
    }
  }, [loading, platforms]);

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
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGettingStarted(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            title="Show getting started guide"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button
            onClick={() => setShowPlatformSettings(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Manage Platforms</span>
          </button>
        </div>
      </div>

      {/* Empty State - No Platforms */}
      {!loading && platforms.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 p-12 text-center mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Review Management!</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Track and respond to reviews from Google, Yelp, Facebook, and more - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowGettingStarted(true)}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center justify-center space-x-2"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Show Me How It Works</span>
              </button>
              <button
                onClick={() => setShowPlatformSettings(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Platform</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && platforms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Average Rating */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 group relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="relative group/tooltip">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    Your overall rating across all reviews
                  </div>
                </div>
              </div>
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
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <div className="relative group/tooltip">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    Total number of reviews tracked
                  </div>
                </div>
              </div>
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
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-600">Needs Reply</p>
                <div className="relative group/tooltip">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    Reviews you haven't replied to yet
                  </div>
                </div>
              </div>
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
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium text-gray-600">Negative Reviews</p>
                <div className="relative group/tooltip">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="hidden group-hover/tooltip:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    Reviews with 1-2 stars needing attention
                  </div>
                </div>
              </div>
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

      {/* No Reviews Yet - Helpful Tip */}
      {!loading && platforms.length > 0 && reviews.length === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Great! Your platforms are set up.</h3>
              <p className="text-gray-700 mb-4">Now let's add some reviews. You have two options:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2">1️⃣ Try it with sample data</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Generate demo reviews to see how everything works before adding real ones.
                  </p>
                  <button
                    onClick={() => setShowPlatformSettings(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Generate Sample Reviews →
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2">2️⃣ Add your real reviews</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Copy reviews from your platforms and add them manually. Automatic sync coming soon!
                  </p>
                  <button
                    onClick={() => setShowGettingStarted(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    See Step-by-Step Guide →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {platforms.length > 0 && reviews.length > 0 && (
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
      )}

      {/* Trends Chart */}
      {platforms.length > 0 && reviews.length > 0 && (
        <div className="mb-6">
          <ReviewTrends platformId={selectedPlatform !== 'all' ? selectedPlatform : undefined} />
        </div>
      )}

      {/* Reviews List */}
      {platforms.length > 0 && reviews.length > 0 && (
        <ReviewList
          reviews={reviews}
          onReply={handleReplyToReview}
          onToggleFlag={handleToggleFlag}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {/* Getting Started Guide */}
      {showGettingStarted && (
        <GettingStartedGuide
          onClose={() => {
            setShowGettingStarted(false);
            localStorage.setItem('reviews_guide_dismissed', 'true');
          }}
          onOpenSettings={() => {
            setShowGettingStarted(false);
            setShowPlatformSettings(true);
          }}
        />
      )}

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
