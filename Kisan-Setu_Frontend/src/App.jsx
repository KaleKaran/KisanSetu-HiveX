import React, { useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import FarmForm from './components/Inputs/FarmForm';
import UsageCharts from './components/Analytics/UsageCharts';
import AlertsPage from './components/Alerts/AlertsPage';
import VoiceAssistant from './components/VoiceAssistant/VoiceMic';
import LoginPage from './components/Auth/LoginPage';
import GPDashboard from './components/GramPanchayat/GPDashboard';
import { motion, AnimatePresence } from 'framer-motion';

const FarmerLayout = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inputs':
        return <FarmForm />;
      case 'analytics':
        return <UsageCharts />;
      case 'alerts':
        return <AlertsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-slate-50 font-inter text-slate-900 min-h-screen transition-colors duration-500">
        <Sidebar activeTab={activeTab} onTabSelect={setActiveTab} onLogout={onLogout} />
        <div className="lg:pl-80 min-h-screen transition-all duration-500">
          <Navbar />
          <main className="p-8 lg:p-12 pt-32 lg:pt-32 max-w-7xl mx-auto pb-24 relative z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <VoiceAssistant />
      </div>
    </div>
  );
};

function AuthenticatedApp() {
  const { session, setSession, dataMode, apiJson, logout } = useAuth();
  const [liveProfile, setLiveProfile] = useState(null);

  useEffect(() => {
    if (!session || session.user.role !== 'farmer' || dataMode !== 'live') {
      setLiveProfile(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiJson('/api/farmer/profile');
        const data = await res.json();
        if (!cancelled && res.ok) setLiveProfile(data.profile);
      } catch {
        if (!cancelled) setLiveProfile(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, dataMode, apiJson]);

  if (!session) {
    return <LoginPage onAuthenticated={(s) => setSession(s)} />;
  }

  const gpOperator = {
    name: session.user.display_name || session.user.username,
    id: session.user.username,
    panchayat: session.user.panchayat_code || '—',
  };

  if (session.user.role === 'gp_officer') {
    return (
      <AppProvider dataMode={dataMode} authToken={session.token} liveProfile={null}>
        <GPDashboard operator={gpOperator} onLogout={logout} />
      </AppProvider>
    );
  }

  return (
    <AppProvider dataMode={dataMode} authToken={session.token} liveProfile={liveProfile}>
      <FarmerLayout onLogout={logout} />
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
