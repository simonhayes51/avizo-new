import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '29',
      description: 'Perfect for solo professionals getting started',
      icon: Sparkles,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Up to 100 clients',
        'Unlimited appointments',
        'Client messaging',
        'Basic analytics',
        'Email support',
        'Mobile app access',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '79',
      description: 'For growing businesses with a team',
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Unlimited clients',
        'Unlimited appointments',
        'Advanced messaging & templates',
        'Marketing campaigns (Email & SMS)',
        'Loyalty & rewards program',
        'Team management (up to 5 staff)',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '199',
      description: 'For large businesses and agencies',
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'White-label options',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Phone support',
        'Custom training',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>

          <div className="inline-flex items-center gap-4 p-2 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">
              Monthly
            </button>
            <button className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold">
              Yearly <span className="text-emerald-600 text-sm ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'border-4 border-purple-500 transform scale-105' : 'border-2 border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Name & Price */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate('/app/dashboard')}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all mb-8 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                      What's included:
                    </p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.',
              },
              {
                q: 'Is there a setup fee?',
                a: 'No setup fees, ever. The price you see is the price you pay.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. Cancel anytime with no penalties or fees. Your data is always yours to export.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund you in full.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of businesses managing their operations with Avizo
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Start Your Free Trial
          </button>
          <p className="mt-4 text-blue-100 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
