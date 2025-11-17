import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Conversations from './components/Conversations';
import Automations from './components/Automations';
import Settings from './components/Settings';
import Clients from './components/Clients';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import NotificationCenter from './components/NotificationCenter';
import LoyaltyProgram from './components/LoyaltyProgram';
import MarketingCampaigns from './components/MarketingCampaigns';
import TeamManagement from './components/TeamManagement';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="automations" element={<Automations />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="loyalty" element={<LoyaltyProgram />} />
          <Route path="marketing" element={<MarketingCampaigns />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="/app/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
