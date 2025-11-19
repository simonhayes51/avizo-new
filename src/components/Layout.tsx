import { ReactNode, useState, useEffect } from 'react';
import { Calendar, MessageSquare, Zap, Settings, LayoutDashboard, Users, CalendarDays, BarChart3, LogOut, Bell, Trophy, Send, UserCog, Menu, X, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import api from '../lib/api';
import AIAssistant from './AIAssistant';

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Load data for AI Assistant context
    const loadData = async () => {
      try {
        const [clientsData, appointmentsData] = await Promise.all([
          api.clients.getAll().catch(() => []),
          api.appointments.getAll({
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }).catch(() => []),
        ]);
        setClients(clientsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Failed to load data for AI:', error);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  const navItems = [
    { to: '/app/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/app/clients', icon: <Users className="w-5 h-5" />, label: 'Clients' },
    { to: '/app/calendar', icon: <CalendarDays className="w-5 h-5" />, label: 'Calendar' },
    { to: '/app/conversations', icon: <MessageSquare className="w-5 h-5" />, label: 'Messages' },
    { to: '/app/payments', icon: <DollarSign className="w-5 h-5" />, label: 'Payments' },
    { to: '/app/automations', icon: <Zap className="w-5 h-5" />, label: 'Automations' },
    { to: '/app/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
    { to: '/app/marketing', icon: <Send className="w-5 h-5" />, label: 'Marketing' },
    { to: '/app/loyalty', icon: <Trophy className="w-5 h-5" />, label: 'Loyalty' },
    { to: '/app/team', icon: <UserCog className="w-5 h-5" />, label: 'Team' },
    { to: '/app/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
    { to: '/app/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Top Header - Mobile Only */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Avizo
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Avizo
                </span>
              </div>
            )}
            {sidebarCollapsed && <Calendar className="w-8 h-8 text-blue-600 mx-auto" />}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`
                  }
                  title={sidebarCollapsed ? item.label : ''}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto animate-slideIn">
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

      {/* Bottom Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-30">
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

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pb-20 lg:pb-0 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Outlet />
      </main>

      {/* AI Assistant - Available Globally */}
      <AIAssistant clients={clients} appointments={appointments} />
    </div>
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
          isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
        }`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
}
