import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Droplets, FlaskConical, Filter, Calendar, TrendingUp } from 'lucide-react';

const baseWaterData = [
  { month: 'Jan', usage: 450 },
  { month: 'Feb', usage: 520 },
  { month: 'Mar', usage: 600 },
  { month: 'Apr', usage: 850 },
  { month: 'May', usage: 980 },
  { month: 'Jun', usage: 740 },
];

const fertilizerData = [
  { name: 'Nitrogen', value: 40, color: '#10b981' },
  { name: 'Phosphorus', value: 30, color: '#f59e0b' },
  { name: 'Potassium', value: 30, color: '#3b82f6' },
];

const Analytics = () => {
  const { t } = useApp();
  const [activeCategory, setActiveCategory] = React.useState('Water');
  const [waterAnalytics, setWaterAnalytics] = React.useState([]);
  const [avgUsage, setAvgUsage] = React.useState(0);
  const [dailyAvg, setDailyAvg] = React.useState(0);
  const [growthPercent, setGrowthPercent] = React.useState(0);

  // Randomize water data on every mount/refresh
  React.useEffect(() => {
    const randomized = baseWaterData.map(d => ({
      ...d,
      usage: Math.floor(Math.random() * 600) + 300
    }));
    setWaterAnalytics(randomized);

    // Calculate dynamic average from randomized data
    const total = randomized.reduce((sum, d) => sum + d.usage, 0);
    const avg = Math.round(total / randomized.length);
    setAvgUsage(avg);

    // Daily average (monthly / 30 days)
    setDailyAvg(Math.round(avg / 30));

    // Growth % from first to last month
    const first = randomized[0].usage;
    const last = randomized[randomized.length - 1].usage;
    const pct = Math.round(((last - first) / first) * 100);
    setGrowthPercent(pct);
  }, []);

  // Light-theme friendly tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-lg">
          <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{label}</p>
          <p className="text-sm font-bold text-blue-600 mt-1">{payload[0].value} Gallons</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white uppercase mb-2 leading-none">
            Consumption <span className={`${activeCategory === 'Water' ? 'text-blue-600' : 'text-kisan-green-600'}`}>Analytics</span>
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase">
            {activeCategory === 'Water' ? 'Monitoring monthly water consumption and usage trends.' : 'Visualizing fertilizer distribution and nutrient ratios.'}
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-2">
           {['Water', 'Fertilizer'].map(cat => (
             <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? (cat === 'Water' ? 'bg-blue-600' : 'bg-kisan-green-600') + ' text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50'}`}
             >
                {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="ring-0 min-h-[500px]">
        {activeCategory === 'Water' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl">
                     <Droplets className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('water_usage')}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{avgUsage}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Gallons/Month Avg</span>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                    <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#dbeafe', opacity: 0.3}} />
                    <Bar dataKey="usage" radius={[12, 12, 0, 0]}>
                       {waterAnalytics.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === waterAnalytics.length - 1 ? '#2563eb' : '#bfdbfe'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-600 p-12 rounded-[3.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <TrendingUp className="w-6 h-6 text-blue-200" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Usage Summary</span>
                  </div>
                  <h4 className="text-4xl font-black font-outfit tracking-tighter mb-6 leading-[1.1]">
                    Water usage {growthPercent >= 0 ? 'increased' : 'decreased'} by {Math.abs(growthPercent)}% this season.
                  </h4>
                  <p className="text-blue-100 font-bold text-sm leading-loose opacity-80 uppercase tracking-wide">
                    Monthly average consumption is {avgUsage} gallons across all monitored sectors. 
                    Irrigation patterns are being tracked to optimize water distribution.
                  </p>
               </div>
               
               <div className="pt-10 mt-10 border-t border-white/20 grid grid-cols-2 gap-8">
                  <div>
                     <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">Daily Avg Usage</p>
                     <p className="text-2xl font-black tracking-tighter">{dailyAvg} Gallons</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">Trend This Season</p>
                     <p className="text-2xl font-black tracking-tighter">{growthPercent >= 0 ? '+' : ''}{growthPercent}%</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl">
                     <FlaskConical className="w-5 h-5" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight font-outfit">{t('fertilizer_usage')}</h3>
                </div>

                <div className="space-y-8">
                   {fertilizerData.map((f) => (
                     <div key={f.name} className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em]">
                           <span className="text-slate-400">{f.name}</span>
                           <span className="text-slate-800 dark:text-white">{f.value}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                           <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${f.value}%`, backgroundColor: f.color }}></div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 relative group/info">
                   <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-4 h-4 text-emerald-500" />
                      <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white ring-2 ring-emerald-100 dark:ring-emerald-900/50 shadow-md">
                         INFO
                      </span>
                   </div>
                   <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                     Total allocation: <span className="text-slate-900 dark:text-white">1,250 kg</span> for current deployment cycle.
                   </p>
                </div>
              </div>

              <div className="w-full lg:w-[450px] flex flex-col items-center">
                 <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fertilizerData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          {fertilizerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', fontSize: '10px' }} itemStyle={{ color: '#1e293b' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                       <Calendar className="w-3 h-3" />
                       Next Refill: Oct 12, 2026
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
