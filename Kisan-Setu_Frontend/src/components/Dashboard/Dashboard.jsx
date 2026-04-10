import React from 'react';
import { useApp } from '../../context/AppContext';
import SensorCard from './SensorCard';
import { Droplets, Thermometer, Wind, FlaskConical, Sprout, TrendingUp, RefreshCw, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Label } from 'recharts';

// Generate randomized chart data for a given timeframe
const generateChartData = (timeframe) => {
  if (timeframe === 'WEEK') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      moisture: Math.round(25 + Math.random() * 30),
      temp: Math.round(18 + Math.random() * 15),
    }));
  } else {
    // MONTH: 4 weeks of data
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map(week => ({
      name: week,
      moisture: Math.round(30 + Math.random() * 35),
      temp: Math.round(20 + Math.random() * 18),
    }));
  }
};

const Dashboard = () => {
  const { sensorData, t, randomizeSensors } = useApp();
  const [timeframe, setTimeframe] = React.useState('WEEK');
  const [chartData, setChartData] = React.useState(() => generateChartData('WEEK'));
  const [syncing, setSyncing] = React.useState(false);

  // Regenerate chart data when timeframe changes
  React.useEffect(() => {
    setChartData(generateChartData(timeframe));
  }, [timeframe]);

  // Live Sync handler — refreshes all sensor values + chart
  const handleLiveSync = () => {
    setSyncing(true);
    randomizeSensors();
    setChartData(generateChartData(timeframe));
    setTimeout(() => setSyncing(false), 600);
  };

  const sensors = [
    { id: 1, title: t('soil_moisture'), value: sensorData.moisture, unit: '%', icon: Droplets, colorClass: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' }, trend: parseFloat((Math.random() * 5 - 2).toFixed(1)) },
    { id: 2, title: t('ph_level'), value: sensorData.ph, unit: 'pH', icon: FlaskConical, colorClass: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' }, trend: parseFloat((Math.random() * 1 - 0.5).toFixed(1)) },
    { id: 3, title: t('temperature'), value: sensorData.temp, unit: '°C', icon: Thermometer, colorClass: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' }, trend: parseFloat((Math.random() * 6 - 2).toFixed(1)) },
    { id: 4, title: t('humidity'), value: sensorData.humidity, unit: '%', icon: Wind, colorClass: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' }, trend: parseFloat((Math.random() * 4 - 2).toFixed(1)) },
  ];

  // Custom tooltip for light/dark mode readability
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-lg">
          <p className="text-xs font-black text-slate-800 dark:text-white uppercase mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black font-outfit tracking-tight text-slate-800 dark:text-white uppercase mb-2">
            Field Monitoring <span className="text-kisan-green-600 block sm:inline">2.0</span>
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-[0.2em] uppercase max-w-lg leading-relaxed">
            Real-time multispectral analysis from Sector 4D. Healthy vegetative growth detected.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleLiveSync}
            className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 active:scale-95 group"
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            {syncing ? 'Syncing...' : 'Live Sync'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} {...sensor} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Hydration & Temp Trends</h3>
            <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <button 
                onClick={() => setTimeframe('WEEK')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black shadow-sm transition-all ${timeframe === 'WEEK' ? 'bg-white dark:bg-slate-700 dark:text-white text-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100'}`}
              >
                WEEK
              </button>
              <button 
                onClick={() => setTimeframe('MONTH')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${timeframe === 'MONTH' ? 'bg-white dark:bg-slate-700 dark:text-white text-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100'}`}
              >
                MONTH
              </button>
            </div>
          </div>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}}>
                   <Label value={timeframe === 'WEEK' ? 'Day' : 'Period'} offset={-10} position="insideBottom" fontSize={10} fill="#94a3b8" />
                </XAxis>
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}}>
                   <Label value="Value" angle={-90} position="insideLeft" fontSize={10} fill="#94a3b8" />
                </YAxis>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend iconType="circle" fontSize={10} wrapperStyle={{ paddingTop: '20px' }} />
                <Area name="Soil Moisture (%)" type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                <Area name="Temp (°C)" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
          <div className="bg-gradient-to-br from-kisan-green-600 to-emerald-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-kisan-green-100 dark:shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
            <Sprout className="w-10 h-10 mb-6 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10 uppercase tracking-tight">NPK BALANCE</h3>
            <p className="text-kisan-green-100/70 text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Live Sensor Readings</p>
            <div className="space-y-6 relative z-10">
              {[
                {l: 'N', full: 'Nitrogen', v: sensorData.n, max: 160, c: 'bg-white'}, 
                {l: 'P', full: 'Phosphorus', v: sensorData.p, max: 90, c: 'bg-white'}, 
                {l: 'K', full: 'Potassium', v: sensorData.k, max: 120, c: 'bg-white'}
              ].map((n) => (
                <div key={n.l}>
                  <div className="flex justify-between text-[10px] font-black tracking-widest mb-2">
                    <span>{n.l} ({n.full})</span>
                    <span className="text-[12px]">{n.v} mg/kg</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div initial={{width: 0}} animate={{width: `${Math.min(100, Math.round((n.v / n.max) * 100))}%`}} transition={{duration: 0.8}} className={`h-full ${n.c} rounded-full`}></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">System Alerts</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
            </div>
            <div className="space-y-4">
               <div className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/30">
                 <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl">
                    <Bell className="w-4 h-4" />
                 </div>
                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight leading-relaxed">
                   Low moisture spike in Sector 4 North.
                 </p>
               </div>
               <div className="flex gap-4 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                 <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                 </div>
                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight leading-relaxed">
                   Optimal N-Level for vegetative stage.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
