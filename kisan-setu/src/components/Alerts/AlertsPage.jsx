import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, ShieldAlert, Cpu, Activity, Clock } from 'lucide-react';

const AlertsPage = () => {
  const { alerts, t } = useApp();

  const detailedAlerts = [
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
        {detailedAlerts.map((alert, index) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={alert.id}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-8 group hover:shadow-xl transition-all"
          >
            <div className={`p-5 rounded-[2rem] bg-${alert.color}-50 dark:bg-${alert.color}-500/10 text-${alert.color}-500 shadow-sm transition-transform group-hover:scale-110`}>
              <alert.icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                 <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{alert.title}</h3>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${alert.color}-500 text-white shadow-lg shadow-${alert.color}-200 dark:shadow-none`}>
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
               <button className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
                 ACKNOWLEDGE
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-12 bg-slate-100/50 dark:bg-slate-900/30 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] text-center space-y-4">
          <div className="p-4 bg-white dark:bg-slate-800 w-fit mx-auto rounded-full shadow-sm">
             <ShieldAlert className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">All other modules operating within nominal parameters</p>
      </div>
    </div>
  );
};

export default AlertsPage;
