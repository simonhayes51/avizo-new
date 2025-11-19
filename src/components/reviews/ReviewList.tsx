import { useState } from 'react';
import { Star, Flag, MessageSquare, Calendar, ExternalLink, Send } from 'lucide-react';
import { Review } from '../../types';
import { format } from 'date-fns';

interface ReviewListProps {
  reviews: Review[];
  onReply: (reviewId: string, replyText: string) => Promise<void>;
  onToggleFlag: (reviewId: string, isFlagged: boolean) => Promise<void>;
  onMarkAsRead: (reviewId: string) => Promise<void>;
}

export default function ReviewList({ reviews, onReply, onToggleFlag, onMarkAsRead }: ReviewListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      await onReply(reviewId, replyText);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
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

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    return sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) : 'Unknown';
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
        <p className="text-gray-600">
          No reviews match your current filters. Try adjusting your filters or add a review platform to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h2>

      {reviews.map((review) => (
        <div
          key={review.id}
          className={`bg-white rounded-lg shadow-sm border ${
            !review.is_read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
          } p-6 transition-all`}
          onClick={() => {
            if (!review.is_read) {
              onMarkAsRead(review.id);
            }
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{review.reviewer_name}</h3>
                {renderStars(review.rating)}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(
                    review.sentiment
                  )}`}
                >
                  {getSentimentLabel(review.sentiment)}
                </span>
                {!review.is_read && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    New
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {review.platform_name && (
                  <div className="flex items-center space-x-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>{review.platform_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(review.review_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFlag(review.id, review.is_flagged);
              }}
              className={`p-2 rounded-lg transition-colors ${
                review.is_flagged
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={review.is_flagged ? 'Unflag review' : 'Flag for attention'}
            >
              <Flag className="h-5 w-5" />
            </button>
          </div>

          {/* Review Comment */}
          {review.comment && (
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          )}

          {/* Existing Reply */}
          {review.is_replied && review.reply_text && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Your Reply</p>
                  <p className="text-sm text-gray-700">{review.reply_text}</p>
                  {review.reply_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Replied on {format(new Date(review.reply_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reply Section */}
          {!review.is_replied && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {replyingTo === review.id ? (
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={submitting}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!replyText.trim() || submitting}
                    >
                      <Send className="h-4 w-4" />
                      <span>{submitting ? 'Sending...' : 'Send Reply'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(review.id);
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply to review</span>
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
