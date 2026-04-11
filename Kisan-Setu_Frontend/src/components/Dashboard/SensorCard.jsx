import React from 'react';
import { motion } from 'framer-motion';

const SensorCard = ({ title, value, unit, icon: Icon, colorClass, trend }) => {
  const hasTrend = trend !== 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.05, shadow: '0 40px 60px -15px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-56 relative overflow-hidden group"
    >
      <div className={`absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.15] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 scale-[3]`}>
        <Icon className="w-24 h-24" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className={`p-4 rounded-[1.5rem] ${colorClass.bg} ${colorClass.text} shadow-sm border border-black/[0.03]`}>
          <Icon className="w-7 h-7" />
        </div>
        {hasTrend && (
          <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${trend > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
            {typeof value === 'number' ? (Math.abs(value) < 0.01 ? '0.0' : value.toFixed(1)) : value}
          </h3>
          <span className="text-slate-300 dark:text-slate-600 font-bold text-base tracking-tight">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SensorCard;
