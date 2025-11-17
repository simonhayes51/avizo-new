import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Users, Calendar, MessageSquare, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    id: 1,
    title: 'Welcome to Avizo!',
    description: 'Let\'s get you started with a quick tour of the platform. This will only take 2 minutes.',
    icon: Sparkles,
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 2,
    title: 'Add Your First Client',
    description: 'Import clients from CSV or add them manually. You can also skip this and add them later.',
    icon: Users,
    color: 'from-emerald-500 to-green-600',
    action: 'Go to Clients',
    route: '/app/clients',
  },
  {
    id: 3,
    title: 'Set Up Your Calendar',
    description: 'Create your first appointment or block out your availability. Everything syncs in real-time.',
    icon: Calendar,
    color: 'from-violet-500 to-purple-600',
    action: 'Open Calendar',
    route: '/app/calendar',
  },
  {
    id: 4,
    title: 'You\'re All Set!',
    description: 'Explore features like Marketing Campaigns, Loyalty Programs, and Team Management whenever you\'re ready.',
    icon: CheckCircle,
    color: 'from-pink-500 to-rose-600',
  },
];

export default function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    const isDemo = localStorage.getItem('is_demo');

    if (!hasCompletedOnboarding && isDemo) {
      // Small delay to let the dashboard load first
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleAction = (route?: string) => {
    if (route) {
      navigate(route);
    }
    handleNext();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative p-8 border-b border-slate-200">
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>

          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
            <StepIcon className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">{step.title}</h2>
          <p className="text-lg text-slate-600">{step.description}</p>
        </div>

        {/* Progress */}
        <div className="px-8 py-4 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${step.color} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Everything in One Place</h3>
                  <p className="text-sm text-slate-600">Manage appointments, clients, messaging, marketing, and team all from this dashboard.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Premium Features Included</h3>
                  <p className="text-sm text-slate-600">Loyalty programs, marketing campaigns, team management - all ready to use.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Easy to Use</h3>
                  <p className="text-sm text-slate-600">Designed for business owners, not tech experts. Get started in minutes.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="text-center py-8">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${step.color} mx-auto mb-6 flex items-center justify-center shadow-xl`}>
                <StepIcon className="w-12 h-12 text-white" />
              </div>
              <p className="text-slate-600 mb-6 text-lg">
                Click below to explore this feature, or skip to continue the tour.
              </p>
            </div>
          )}

          {currentStep === steps.length - 1 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mb-6 flex items-center justify-center shadow-xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">You're Ready to Go!</h3>
              <p className="text-slate-600 text-lg mb-6">
                Explore the platform at your own pace. Access help anytime from the navigation menu.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">9</div>
                  <div className="text-xs text-slate-600">Features</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
                  <div className="text-xs text-slate-600">Setup Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">∞</div>
                  <div className="text-xs text-slate-600">Possibilities</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <button
              onClick={() => handleNext()}
              className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition text-lg"
            >
              Skip
            </button>
          )}

          {step.action && step.route ? (
            <button
              onClick={() => handleAction(step.route)}
              className={`flex-1 px-6 py-4 bg-gradient-to-r ${step.color} text-white rounded-xl font-semibold hover:shadow-xl transition text-lg flex items-center justify-center gap-2`}
            >
              {step.action}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`flex-1 px-6 py-4 bg-gradient-to-r ${step.color} text-white rounded-xl font-semibold hover:shadow-xl transition text-lg flex items-center justify-center gap-2`}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
