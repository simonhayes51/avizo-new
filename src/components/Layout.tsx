import { ReactNode, useState } from 'react';
import { Calendar, MessageSquare, Zap, Settings, LayoutDashboard, Users, CalendarDays, BarChart3, LogOut, Bell, Trophy, Send, UserCog, Menu, X } from 'lucide-react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import api from '../lib/api';

export default function Layout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  const navItems = [
    { to: '/app/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Today' },
    { to: '/app/clients', icon: <Users className="w-5 h-5" />, label: 'Clients' },
    { to: '/app/calendar', icon: <CalendarDays className="w-5 h-5" />, label: 'Calendar' },
    { to: '/app/conversations', icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
    { to: '/app/automations', icon: <Zap className="w-5 h-5" />, label: 'Automations' },
    { to: '/app/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
    { to: '/app/marketing', icon: <Send className="w-5 h-5" />, label: 'Marketing' },
    { to: '/app/loyalty', icon: <Trophy className="w-5 h-5" />, label: 'Loyalty' },
    { to: '/app/team', icon: <UserCog className="w-5 h-5" />, label: 'Team' },
    { to: '/app/notifications', icon: <Bell className="w-5 h-5" />, label: 'Alerts' },
    { to: '/app/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Desktop Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Avizo
              </span>
            </div>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <NavButton key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 xl:hidden overflow-y-auto animate-slideIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Avizo
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Bottom Mobile Navigation - Key Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 xl:hidden z-30 safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          <MobileNavButton to="/app/dashboard" icon={<LayoutDashboard className="w-6 h-6" />} label="Today" />
          <MobileNavButton to="/app/clients" icon={<Users className="w-6 h-6" />} label="Clients" />
          <MobileNavButton to="/app/calendar" icon={<CalendarDays className="w-6 h-6" />} label="Calendar" />
          <MobileNavButton to="/app/conversations" icon={<MessageSquare className="w-6 h-6" />} label="Messages" />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center p-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {/* Main Content - Add padding bottom for mobile nav */}
      <main className="max-w-7xl mx-auto pb-20 xl:pb-0">
        <Outlet />
      </main>
    </div>
  );
}

interface NavButtonProps {
  to: string;
  icon: ReactNode;
  label: string;
}

function NavButton({ to, icon, label }: NavButtonProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {icon}
      <span className="hidden 2xl:inline">{label}</span>
    </NavLink>
  );
}

interface MobileNavButtonProps {
  to: string;
  icon: ReactNode;
  label: string;
}

function MobileNavButton({ to, icon, label }: MobileNavButtonProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center p-2 min-w-[60px] rounded-lg transition-colors ${
          isActive
            ? 'text-blue-600'
            : 'text-slate-600 hover:text-blue-600'
        }`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
}
