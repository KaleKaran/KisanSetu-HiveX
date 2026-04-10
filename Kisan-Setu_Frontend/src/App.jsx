import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import FarmForm from './components/Inputs/FarmForm';
import UsageCharts from './components/Analytics/UsageCharts';
import AlertsPage from './components/Alerts/AlertsPage';
import VoiceAssistant from './components/VoiceAssistant/VoiceMic';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inputs': return <FarmForm />;
      case 'analytics': return <UsageCharts />;
      case 'alerts': return <AlertsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-slate-50 dark:bg-slate-950 font-inter text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500">
        <Sidebar activeTab={activeTab} onTabSelect={setActiveTab} />
        <div className="lg:pl-80 min-h-screen transition-all duration-500">
          <Navbar />
          <main className="p-8 lg:p-12 pt-32 lg:pt-32 max-w-7xl mx-auto pb-24 relative z-0">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.4, ease: "easeOut" }}
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

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
