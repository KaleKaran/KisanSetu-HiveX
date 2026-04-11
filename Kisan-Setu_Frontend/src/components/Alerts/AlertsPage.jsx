import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, Cpu, Activity, Clock } from 'lucide-react';

const AlertsPage = () => {
  const { dataMode } = useAuth();
  const [activeAlerts, setActiveAlerts] = React.useState([1, 2, 3]);
  const [acknowledged, setAcknowledged] = React.useState([]);

  const isLive = dataMode === 'live';

  const handleAcknowledge = (id) => {
    setAcknowledged(prev => [...prev, id]);
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(aId => aId !== id));
    }, 400); 
  };

  const detailedAlerts = isLive ? [] : [
    {
      id: 1,
      type: 'critical',
      title: 'Sensor Abnormality Detected',
      message: 'Moisture sensor in Sector 4 is returning out-of-range values (0.0%).',
      cause: 'Possible cause: Sensor hardware failure or probe disconnected.',
      time: '10 mins ago',
      icon: Cpu,
      color: 'rose'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Temperature Spike',
      message: 'Temperature in Sector 2 rose by 8°C in under 15 minutes.',
      cause: 'Possible cause: Localized equipment heat or environmental anomaly.',
      time: '45 mins ago',
      icon: Activity,
      color: 'amber'
    },
    {
      id: 3,
      type: 'info',
      title: 'Calibration Reminder',
      message: 'pH sensors are due for monthly recalibration.',
      cause: 'Standard maintenance protocol required for accuracy.',
      time: '2 hours ago',
      icon: ShieldAlert,
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div>
        <h2 className="text-4xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white uppercase mb-2 leading-none">
          System <span className="text-rose-500">Alerts</span>
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase">Monitoring sensor health and environmental anomalies in real-time.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {detailedAlerts.filter(a => activeAlerts.includes(a.id)).map((alert) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: acknowledged.includes(alert.id) ? 0 : 1, 
              x: acknowledged.includes(alert.id) ? 100 : 0 
            }}
            transition={{ duration: 0.4 }}
            key={alert.id}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-8 group hover:shadow-xl transition-all"
          >
            <div className={`p-5 rounded-[2rem] shadow-sm transition-transform group-hover:scale-110 
              ${alert.type === 'critical' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600' : 
                alert.type === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 
                'bg-blue-100 dark:bg-blue-500/20 text-blue-600'}`}>
              <alert.icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                 <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{alert.title}</h3>
                 <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md ring-2 
                   ${alert.type === 'critical' ? 'bg-rose-600 text-white ring-rose-100 dark:ring-rose-900/50' : 
                     alert.type === 'warning' ? 'bg-amber-400 text-black ring-amber-100 dark:ring-amber-900/40' : 
                     'bg-blue-600 text-white ring-blue-100 dark:ring-blue-900/50'}`}>
                    {alert.type}
                 </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{alert.message}</p>
              <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-l-4 border-${alert.color}-500`}>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className={`text-${alert.color}-600 dark:text-${alert.color}-400 font-black uppercase mr-2 underline underline-offset-4 decoration-2`}>Investigation:</span>
                  {alert.cause}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4 min-w-[120px]">
               <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" />
                  {alert.time}
               </div>
               <button 
                onClick={() => handleAcknowledge(alert.id)}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
               >
                 {acknowledged.includes(alert.id) ? 'PROCESSED' : 'ACKNOWLEDGE'}
               </button>
            </div>
          </motion.div>
        ))}

        {isLive && detailedAlerts.length === 0 && (
           <div className="flex flex-col items-center justify-center p-24 bg-white/50 dark:bg-slate-900/50 rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-6">
                 <ShieldAlert className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Diagnostic Scan Complete</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-3">All sectors are synchronized with the central database. <br/>No anomalies detected in the current Live Session.</p>
           </div>
        )}
      </div>

      {!isLive && (
        <div className="p-12 bg-slate-100/50 dark:bg-slate-900/30 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] text-center space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 w-fit mx-auto rounded-full shadow-sm">
               <ShieldAlert className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">All other modules operating within nominal parameters</p>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
