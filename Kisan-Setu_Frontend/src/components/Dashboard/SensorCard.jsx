import React from 'react';
import { motion } from 'framer-motion';

const SensorCard = ({ title, value, unit, icon: Icon, colorClass, trend }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-48 relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 scale-[2.5]`}>
        <Icon className="w-24 h-24" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className={`p-3.5 rounded-2xl ${colorClass.bg} ${colorClass.text} shadow-sm border border-black/5`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-3xl font-black text-slate-800 tabular-nums tracking-tight">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </h3>
          <span className="text-slate-400 font-bold text-sm tracking-tight">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SensorCard;
