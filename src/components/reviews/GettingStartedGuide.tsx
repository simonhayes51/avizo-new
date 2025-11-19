import { X, CheckCircle, HelpCircle } from 'lucide-react';

interface GettingStartedGuideProps {
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function GettingStartedGuide({ onClose, onOpenSettings }: GettingStartedGuideProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Review Management!</h2>
            <p className="text-gray-600 mt-1">Get started in 3 easy steps</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Your Review Platforms</h3>
              <p className="text-gray-600 mb-3">
                Connect the platforms where your customers leave reviews. We support:
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Google Reviews</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Yelp</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Facebook</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Trustpilot</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>TripAdvisor</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Any other platform</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Platform
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import or Add Reviews</h3>
              <p className="text-gray-600 mb-3">
                Once you've added a platform, you can:
              </p>
              <ul className="space-y-2 mb-3">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Generate Sample Reviews:</strong> Try out the feature with demo data (great for testing!)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Add Reviews Manually:</strong> Copy and paste reviews from your platforms
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Automatic Sync:</strong> Connect APIs for auto-syncing (
                    <a
                      href="https://github.com/simonhayes51/avizo-new/blob/main/docs/REVIEW_API_SETUP.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      setup guide
                    </a>
                    )
                  </span>
                </li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Quick Tip:</strong> Start with "Generate Samples" to see how it works before adding real reviews.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-green-600">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor & Respond to Reviews</h3>
              <p className="text-gray-600 mb-3">
                Once you have reviews, you can:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">📊 View Analytics</h4>
                  <p className="text-sm text-gray-600">
                    See your average rating, trends, and rating distribution at a glance
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">💬 Reply to Reviews</h4>
                  <p className="text-sm text-gray-600">
                    Respond directly to customer reviews to show you care
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">🚨 Flag Urgent Issues</h4>
                  <p className="text-sm text-gray-600">
                    Mark negative reviews for immediate attention
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">🔍 Filter & Search</h4>
                  <p className="text-sm text-gray-600">
                    Find specific reviews by platform, rating, or reply status
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What Reviews Help With */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Why Managing Reviews Matters:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Build Trust:</strong> Responding to reviews shows you value customer feedback</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Improve Service:</strong> Learn what customers love and what needs improvement</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Attract New Customers:</strong> Great reviews and professional responses attract more business</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Resolve Issues Fast:</strong> Catch and address negative feedback before it spreads</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            I'll set this up later
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Get Started Now →
          </button>
        </div>
      </div>
    </div>
  );
}
