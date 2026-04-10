import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Database, BarChart3, Bell, Settings, LogOut, ChevronRight } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, id, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 mb-2 relative overflow-hidden ${
      active 
        ? 'bg-kisan-green-500 text-white shadow-lg shadow-kisan-green-200 translate-x-2' 
        : 'hover:bg-slate-100 text-slate-500'
    }`}
  >
    <div className="flex items-center gap-3.5 relative z-10">
      <div className={`p-2 rounded-xl transition-colors duration-300 ${
        active ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'
      }`}>
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-kisan-green-600'}`} />
      </div>
      <span className="font-semibold text-sm tracking-wide">{label}</span>
    </div>
    {active && <ChevronRight className="w-4 h-4 text-white/70 relative z-10" />}
  </button>
);

const Sidebar = ({ activeTab, onTabSelect, onLogout }) => {
  const { t } = useApp();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'inputs', icon: Database, label: t('inputs') },
    { id: 'analytics', icon: BarChart3, label: t('analytics') },
    { id: 'alerts', icon: Bell, label: t('alerts') },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-slate-100 z-[60] p-6 flex flex-col transition-all duration-300">
      <div className="flex items-center gap-3.5 mb-12 group cursor-pointer">
        <div className="p-3 bg-kisan-green-100 rounded-2xl rotate-[-6deg] group-hover:rotate-0 transition-all duration-500 shadow-sm border border-kisan-green-200/50">
          <span className="text-3xl">🌱</span>
        </div>
        <div>
          <h1 className="text-2xl font-black font-outfit tracking-tighter text-slate-800 leading-none">
            KISAN <span className="text-kisan-green-600">SETU</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Smart Agriculture</p>
        </div>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            {...item}
            active={activeTab === item.id}
            onClick={onTabSelect}
          />
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3.5 px-4 py-3.5 w-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl group"
        >
          <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-red-100 transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
