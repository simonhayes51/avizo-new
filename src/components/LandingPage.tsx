import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Zap, BarChart3, Users, Clock, CheckCircle, ArrowRight, Trophy, Send, UserCog, Bell, Star, Target, Sparkles } from 'lucide-react';
import api from '../lib/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('driving_instructor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoClick = async () => {
    setLoading(true);
    setError('');
    try {
      await api.auth.createDemoAccount();
      await api.demo.setup();
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.auth.login(email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.auth.register({
        email,
        password,
        businessName,
        businessType,
      });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (showAuth === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-slate-600 mt-2">Sign in to your Avizo account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAuth(null)}
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAuth === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get Started
            </h2>
            <p className="text-slate-600 mt-2">Create your Avizo account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="driving_instructor">Driving Instructor</option>
                <option value="hairdresser">Hairdresser</option>
                <option value="beauty">Beauty Therapist</option>
                <option value="therapist">Therapist</option>
                <option value="personal_trainer">Personal Trainer</option>
                <option value="tutor">Tutor</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAuth(null)}
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Avizo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition"
            >
              Pricing
            </button>
            <button
              onClick={() => setShowAuth('login')}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuth('signup')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">All-in-One Business Management Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Run Your Entire Business
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
              From One Platform
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed">
            Appointments • Messaging • Marketing • Team • Loyalty • Analytics<br/>
            <span className="text-lg text-slate-500">Everything you need to grow your service business</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleDemoClick}
              disabled={loading}
              className="group px-8 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Try Demo - It's Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
            <button
              onClick={() => setShowAuth('signup')}
              className="px-8 py-5 bg-white text-slate-900 border-2 border-slate-300 rounded-2xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
            >
              Get Started Free
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Setup in minutes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-slate-50/50 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Stop juggling multiple tools. Manage your entire business from a single, beautiful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              title: 'Smart Scheduling',
              description: 'Intelligent appointment management with gap detection, recurring bookings, and calendar sync.',
              color: 'from-blue-500 to-blue-600',
            },
            {
              icon: Users,
              title: 'Client Management',
              description: 'Import/export clients, bulk actions, advanced filtering. Keep everything organized.',
              color: 'from-emerald-500 to-green-600',
            },
            {
              icon: MessageSquare,
              title: 'Messaging & Templates',
              description: 'Built-in chat with message templates and quick replies for faster communication.',
              color: 'from-purple-500 to-purple-600',
            },
            {
              icon: Send,
              title: 'Marketing Campaigns',
              description: 'Email & SMS campaigns with analytics. Track opens, clicks, and revenue.',
              color: 'from-pink-500 to-rose-600',
            },
            {
              icon: Trophy,
              title: 'Loyalty & Rewards',
              description: '4-tier loyalty program with points and rewards. Keep clients coming back.',
              color: 'from-amber-500 to-orange-600',
            },
            {
              icon: UserCog,
              title: 'Team Management',
              description: 'Multi-user support with roles, schedules, and performance tracking.',
              color: 'from-indigo-500 to-blue-600',
            },
            {
              icon: BarChart3,
              title: 'Advanced Analytics',
              description: 'Detailed insights into appointments, revenue, and business performance.',
              color: 'from-cyan-500 to-teal-600',
            },
            {
              icon: Zap,
              title: 'Smart Automation',
              description: 'Automated reminders, follow-ups, and workflows. Save hours every week.',
              color: 'from-yellow-500 to-amber-600',
            },
            {
              icon: Bell,
              title: 'Notification Center',
              description: 'Real-time alerts for appointments, messages, and important updates.',
              color: 'from-violet-500 to-purple-600',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-200"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-blue-100">Join the businesses growing with Avizo</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">250K+</div>
              <div className="text-blue-100">Appointments Booked</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4.9 ⭐</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-slate-600">Real stories from real business owners</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "Avizo has completely transformed how I run my driving school. The automated reminders alone save me 10 hours a week!",
              author: "Sarah Johnson",
              role: "Driving Instructor",
              avatar: "SJ",
              rating: 5,
            },
            {
              quote: "The loyalty program feature is incredible. I've seen a 30% increase in repeat bookings since implementing it.",
              author: "Michael Chen",
              role: "Salon Owner",
              avatar: "MC",
              rating: 5,
            },
            {
              quote: "Finally, an all-in-one solution that actually works! Managing my team and tracking performance has never been easier.",
              author: "Emma Davis",
              role: "Spa Manager",
              avatar: "ED",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:border-blue-300 transition">
              <div className="flex mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-8 text-center">Why Choose Avizo?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Save time with automated workflows',
              'Never miss an appointment with smart reminders',
              'Fill gaps in your schedule automatically',
              'Communicate seamlessly with clients',
              'Track your business performance',
              'Grow with marketing campaigns & loyalty programs',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span className="text-lg font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Join hundreds of service professionals who trust Avizo to manage their appointments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDemoClick}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-lg hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Try Demo Now'}
          </button>
          <button
            onClick={() => setShowAuth('signup')}
            className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium text-lg hover:bg-blue-50 transition"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600">
            <p>© 2025 Avizo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
