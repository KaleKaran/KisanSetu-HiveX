import React from 'react';
import { useAuth } from '../../context/AuthContext';

/** Simulation = demo/mock UI defaults; Live = backend DB only for lists & warehouse. */
const DataModeToggle = ({ className = '' }) => {
  const { dataMode, setDataMode } = useAuth();
  const live = dataMode === 'live';

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 bg-slate-100/90 border border-slate-200/80 shadow-inner ${className}`}
      role="group"
      aria-label="Data mode"
    >
      <button
        type="button"
        onClick={() => setDataMode('simulation')}
        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          !live ? 'bg-white text-kisan-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Simulation
      </button>
      <button
        type="button"
        onClick={() => setDataMode('live')}
        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          live ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Live
      </button>
    </div>
  );
};

export default DataModeToggle;
