import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Droplets, FlaskConical, Filter, Calendar, TrendingUp } from 'lucide-react';

const waterData = [
  { month: 'Jan', usage: 450, cost: 120 },
  { month: 'Feb', usage: 520, cost: 140 },
  { month: 'Mar', usage: 600, cost: 180 },
  { month: 'Apr', usage: 850, cost: 260 },
  { month: 'May', usage: 980, cost: 320 },
  { month: 'Jun', usage: 740, cost: 210 },
];

const fertilizerData = [
  { name: 'Nitrogen', value: 40, color: '#10b981' },
  { name: 'Phosphorus', value: 30, color: '#f59e0b' },
  { name: 'Potassium', value: 30, color: '#3b82f6' },
];

const Analytics = () => {
  const { t } = useApp();
  const [activeCategory, setActiveCategory] = React.useState('Water');

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white uppercase mb-2 leading-none">
            Consumption <span className="text-kisan-green-600">Analytics</span>
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase">Visualizing resource utilization metrics and historical trends.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-2">
           {['Water', 'Fertilizer'].map(cat => (
             <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-kisan-green-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50'}`}
             >
                {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ring-0">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl">
                 <Droplets className="w-5 h-5" />
               </div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('water_usage')}</h3>
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">4.2k</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Gallons Avg</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full ring-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc', opacity: 0.5}}
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="usage" radius={[12, 12, 0, 0]}>
                   {waterData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === 4 ? '#3a8a3a' : '#bbe1bb'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl">
                 <FlaskConical className="w-5 h-5" />
               </div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('fertilizer_usage')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fertilizerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {fertilizerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             
             <div className="space-y-6">
                {fertilizerData.map((f) => (
                  <div key={f.name} className="flex flex-col gap-2">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-slate-400">{f.name}</span>
                        <span className="text-slate-800 dark:text-white">{f.value}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-0">
                        <div className="h-full rounded-full" style={{ width: `${f.value}%`, backgroundColor: f.color }}></div>
                     </div>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 translate-y-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                     Total allocation: <span className="text-slate-900 dark:text-white">1250 kg</span> for Sector 4
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
