import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Conversations from './components/Conversations';
import Automations from './components/Automations';
import Settings from './components/Settings';
import DemoDataSetup from './components/DemoDataSetup';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'conversations' | 'automations' | 'settings'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <DemoDataSetup />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'conversations' && <Conversations />}
      {currentView === 'automations' && <Automations />}
      {currentView === 'settings' && <Settings />}
    </Layout>
  );
}

export default App;
