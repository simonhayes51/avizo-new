import { Calendar, MessageSquare, Zap, Settings, LayoutDashboard, Users, CalendarDays, BarChart3, LogOut } from 'lucide-react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import api from '../lib/api';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Avizo
              </span>
            </div>

            <div className="flex items-center gap-1">
              <NavButton
                to="/app/dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Today"
              />
              <NavButton
                to="/app/clients"
                icon={<Users className="w-5 h-5" />}
                label="Clients"
              />
              <NavButton
                to="/app/calendar"
                icon={<CalendarDays className="w-5 h-5" />}
                label="Calendar"
              />
              <NavButton
                to="/app/conversations"
                icon={<MessageSquare className="w-5 h-5" />}
                label="Messages"
              />
              <NavButton
                to="/app/automations"
                icon={<Zap className="w-5 h-5" />}
                label="Automations"
              />
              <NavButton
                to="/app/analytics"
                icon={<BarChart3 className="w-5 h-5" />}
                label="Analytics"
              />
              <NavButton
                to="/app/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto"><Outlet /></main>
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
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  );
}
