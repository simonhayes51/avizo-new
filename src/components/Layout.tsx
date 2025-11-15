import { Calendar, MessageSquare, Zap, Settings, LayoutDashboard } from 'lucide-react';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'conversations' | 'automations' | 'settings';
  onViewChange: (view: 'dashboard' | 'conversations' | 'automations' | 'settings') => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">Avizo</span>
            </div>

            <div className="flex space-x-1">
              <NavButton
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Today"
                active={currentView === 'dashboard'}
                onClick={() => onViewChange('dashboard')}
              />
              <NavButton
                icon={<MessageSquare className="w-5 h-5" />}
                label="Messages"
                active={currentView === 'conversations'}
                onClick={() => onViewChange('conversations')}
              />
              <NavButton
                icon={<Zap className="w-5 h-5" />}
                label="Automations"
                active={currentView === 'automations'}
                onClick={() => onViewChange('automations')}
              />
              <NavButton
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
                active={currentView === 'settings'}
                onClick={() => onViewChange('settings')}
              />
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}

interface NavButtonProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
