import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sprout, MapPin, Calendar, CheckCircle2, Loader2, Sparkles, Droplets, FlaskConical, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const stageInfo = {
  'stage_sowing': 'Seeds are planted and begin to sprout.',
  'stage_vegetative': 'Plant grows extensive vegetative structures.',
  'stage_flowering': 'Plant produces flowers and enters reproductive phase.',
  'stage_harvest': 'Crop reaches full maturity for collection.'
};

const soilImages = {
  'soil_clay': '/soil-types/clay.jpg',
  'soil_sandy': '/soil-types/sandy.jpg',
  'soil_loamy': '/soil-types/loam.jpg',
  'soil_silt': '/soil-types/silt.jpg'
};

const FarmForm = () => {
  const { t, getRecommendation, recommendation, setRecommendation, randomizeSensors, saveRecord, sensorData, setSensorData } = useApp();
  const { dataMode, apiJson, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState(session?.user?.username || '');
  const [formData, setFormData] = useState({
    cropType: '',
    growthStage: '',
    soilType: '',
  });

  const handleRandomize = () => {
    randomizeSensors();
  };

  const handleLoadProfile = async (idOverride = null, silent = false) => {
    const id = idOverride || profileId;
    if (!id) {
       if (!silent) alert('Enter Farmer ID');
       return;
    }
    try {
      const res = await apiJson(`/api/farmer/profile?id=${id}`);
      const data = await res.json();
      if (res.ok && data.profile) {
        const p = data.profile;
        setSensorData({
          n: p.sensors.n,
          p: p.sensors.p,
          k: p.sensors.k,
          ph: p.sensors.ph,
          moisture: p.sensors.moisture,
          temp: p.sensors.temp,
          humidity: p.sensors.humidity,
          rainfall: p.sensors.rainfall,
        });
        if (!idOverride && !silent) alert('Profile loaded successfully');
      } else {
        alert(data.error || 'Profile not found');
      }
    } catch (e) {
      alert('Error connecting to backend');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cropType || !formData.growthStage || !formData.soilType) {
      alert('Please select Crop Type, Growth Stage, and Soil Type before generating synthesis.');
      return;
    }
    setLoading(true);
    setRecommendation(null);
    if (dataMode === 'simulation') randomizeSensors();
    
    setTimeout(async () => {
      const result = await getRecommendation(formData);
      setLoading(false);
    }, 2000);
  };

  const crops = ['crop_wheat', 'crop_rice', 'crop_maize', 'crop_cotton', 'crop_potato', 'crop_sugarcane', 'crop_tomato'];
  const stages = ['stage_sowing', 'stage_vegetative', 'stage_flowering', 'stage_harvest'];
  const soils = ['soil_clay', 'soil_sandy', 'soil_loamy', 'soil_silt'];

  const isLive = dataMode === 'live';

  React.useEffect(() => {
    if (isLive && session?.user?.role === 'farmer') {
      handleLoadProfile(null, true);
    }
  }, [isLive, session]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-kisan-green-50 dark:bg-kisan-green-950/20 text-kisan-green-600 dark:text-kisan-green-400 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 shadow-sm border border-kisan-green-100 dark:border-kisan-green-900/10">
          <Zap className={`w-4 h-4 ${isLive ? 'animate-pulse text-blue-500' : 'text-kisan-green-600'}`} />
          {isLive ? 'LIVE DATA STREAM' : 'IoT Field Simulation'}
        </div>
        <h2 className="text-5xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white uppercase mb-4 leading-none">
          High-Precision Synthesis <span className="text-kisan-green-600">Protocol</span>
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase mb-12">
          Executing high-precision nutrient synthesis mapping based on real-time field telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <motion.div layout className="lg:col-span-5 space-y-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden">
            <div className="space-y-10">
              
              {/* Farmer ID Section */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2 mb-4">
                  <Database className="w-3 h-3" />
                  Farmer Access
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={session?.user?.role === 'farmer' ? (session.user.display_name || session.user.username) : profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    placeholder="Enter Farmer ID"
                    readOnly={session?.user?.role === 'farmer'}
                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold disabled:opacity-75"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleLoadProfile()} 
                    disabled={session?.user?.role === 'farmer'}
                    className="px-4 py-2 bg-kisan-green-600 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50"
                  >
                    Load
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2">
                  <Sprout className="w-3 h-3" />
                  {t('crop_type')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {crops.map((crop) => (
                    <motion.button
                      key={crop}
                      type="button"
                      whileHover={{ scale: 1.05, y: -4, shadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({...formData, cropType: crop})}
                      className={`relative overflow-hidden px-8 py-5 rounded-[2.5rem] text-sm font-black transition-all border-4 text-left flex items-center justify-between group ${
                        formData.cropType === crop 
                        ? 'bg-kisan-green-600 text-white border-kisan-green-600 shadow-2xl shadow-kisan-green-100' 
                        : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-500 hover:border-kisan-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                         <div className={`p-3 rounded-2xl ${formData.cropType === crop ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-kisan-green-50'}`}>
                           <Sprout className="w-5 h-5" />
                         </div>
                         {t(crop)}
                      </div>
                      {formData.cropType === crop && <CheckCircle2 className="w-6 h-6 text-white relative z-10" />}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  {t('growth_stage')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {stages.map((stage) => (
                    <motion.div key={stage} className="relative" whileHover={{ y: -10, scale: 1.02 }}>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, growthStage: stage})}
                        className={`w-full p-8 h-full rounded-[3.5rem] text-[10px] font-black tracking-widest uppercase transition-all border-4 flex flex-col items-center gap-6 text-center group ${
                          formData.growthStage === stage 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xl' 
                          : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-400 hover:border-emerald-300'
                        }`}
                      >
                        <div className={`p-6 rounded-[2.5rem] ${formData.growthStage === stage ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50'} shadow-sm`}>
                           <Database className="w-8 h-8" />
                        </div>
                        {t(stage)}
                        <p className="text-[9px] font-bold opacity-60 normal-case hidden group-hover:block transition-all mt-4 leading-relaxed px-4">
                          {stageInfo[stage]}
                        </p>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {t('soil_type')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {soils.map((soil) => (
                    <motion.button
                      key={soil}
                      type="button"
                      whileHover={{ scale: 1.1, y: -5, rotate: 2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData({...formData, soilType: soil})}
                      className={`relative w-28 h-28 rounded-[2.5rem] overflow-hidden border-[6px] transition-all group ${
                        formData.soilType === soil 
                        ? 'border-kisan-green-600 shadow-[0_20px_50px_rgba(22,163,74,0.3)] scale-110 z-10' 
                        : 'border-white dark:border-slate-900 shadow-md opacity-70 hover:opacity-100'
                      }`}
                    >
                       <img 
                         src={soilImages[soil]} 
                         alt={soil} 
                         className="absolute inset-0 w-full h-full object-cover group-hover:scale-150 transition-transform duration-1000 ease-out"
                        />
                       <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-4 transition-opacity ${formData.soilType === soil ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{t(soil)}</span>
                       </div>
                    </motion.button>
                  ))}
                </div>
              </div>


              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 border border-slate-100 dark:border-slate-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-kisan-green-600" />
                      CALCULATING...
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600">
                        <Sparkles className="w-4 h-4 text-kisan-green-600" />
                      </div>
                      <span className="leading-none">GENERATE SYNTHESIS</span>
                    </div>
                  )}
                </button>
                {!isLive && (
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="px-8 py-5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 font-bold text-[10px] uppercase tracking-widest hover:border-kisan-green-400 transition-all flex items-center gap-3 shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Random Scan
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!loading && !recommendation && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-100/50 dark:bg-slate-900/30 border-4 border-dashed border-slate-200 dark:border-slate-800 p-20 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="p-8 bg-white dark:bg-slate-900 rounded-full shadow-inner animate-pulse-slow">
                   <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">Ready for Analysis</h3>
                   <p className="text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-widest mt-2 px-10">Configure field parameters for AI-driven nutrient synthesis.</p>
                </div>
              </motion.div>
            )}

            {recommendation && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {recommendation.error ? (
                   <div className="bg-white dark:bg-slate-950 p-12 rounded-[4rem] border-4 border-dashed border-rose-100 dark:border-rose-900/30 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                      <div className="p-8 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-full shadow-inner animate-pulse">
                         <AlertTriangle className="w-16 h-16" />
                      </div>
                      <div className="space-y-4 relative z-10">
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                          Synthesis <span className="text-rose-600">Failed</span>
                        </h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto">
                          {recommendation.message}
                        </p>
                      </div>
                      <div className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-left">
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Technical Advisory:</p>
                         <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
                            {recommendation.advisory}
                         </p>
                      </div>
                   </div>
                ) : (
                  <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-12 rounded-[4rem] shadow-2xl border border-white dark:border-slate-700/50 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                       <CheckCircle2 className="w-48 h-48" />
                     </div>

                     <div className="mb-12">
                       <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Synthesis <span className="text-kisan-green-600">Complete</span></h3>
                       <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] tracking-[0.25em] uppercase">High Resolution Recommendations generated</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white dark:border-slate-700/50">
                           <div className="p-3 bg-kisan-green-50 dark:bg-kisan-green-500/10 text-kisan-green-600 w-fit rounded-2xl mb-6 shadow-inner">
                              <FlaskConical className="w-6 h-6" />
                           </div>
                           <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('fertilizer')}</h4>
                           <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-1">{recommendation.fertilizer}</p>
                           <div className="mt-2 text-[10px] font-bold text-kisan-green-600 dark:text-kisan-green-400 uppercase tracking-widest">
                              Recommended: {recommendation.dosage}
                           </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white dark:border-slate-700/50">
                           <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 w-fit rounded-2xl mb-6 shadow-inner">
                              <Droplets className="w-6 h-6" />
                           </div>
                           <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('irrigation')}</h4>
                           <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight">Apply Irrigation</p>
                           <p className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Growth Phase Optimization</p>
                        </div>
                     </div>

                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-5 rounded-2xl shadow-md border-2" style={{ backgroundColor: recommendation.phStatus.includes('NORMAL') ? '#D1FAE5' : '#FEE2E2', border: 'none' }}>
                             <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Soil pH</p>
                             <p className="text-sm font-black" style={{ color: recommendation.phStatus.includes('NORMAL') ? '#065f46' : '#991b1b' }}>{recommendation.phStatus}</p>
                          </div>
                          <div className="p-5 rounded-2xl shadow-md transition-all" style={{ backgroundColor: recommendation.nStatus === 'MEDIUM' ? '#D1FAE5' : recommendation.nStatus === 'HIGH' ? '#FEF3C7' : '#FEE2E2' }}>
                             <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Nitrogen Status</p>
                             <p className="text-sm font-black" style={{ color: recommendation.nStatus === 'MEDIUM' ? '#065f46' : recommendation.nStatus === 'HIGH' ? '#92400e' : '#991b1b' }}>{recommendation.nStatus}</p>
                          </div>
                          <div className="p-5 rounded-2xl shadow-md transition-all" style={{ backgroundColor: recommendation.pStatus === 'MEDIUM' ? '#D1FAE5' : recommendation.pStatus === 'HIGH' ? '#FEF3C7' : '#FEE2E2' }}>
                             <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Phosphorus Status</p>
                             <p className="text-sm font-black" style={{ color: recommendation.pStatus === 'MEDIUM' ? '#065f46' : recommendation.pStatus === 'HIGH' ? '#92400e' : '#991b1b' }}>{recommendation.pStatus}</p>
                          </div>
                          <div className="p-5 rounded-2xl shadow-md transition-all" style={{ backgroundColor: recommendation.kStatus === 'MEDIUM' ? '#D1FAE5' : recommendation.kStatus === 'HIGH' ? '#FEF3C7' : '#FEE2E2' }}>
                             <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Potassium Status</p>
                             <p className="text-sm font-black" style={{ color: recommendation.kStatus === 'MEDIUM' ? '#065f46' : recommendation.kStatus === 'HIGH' ? '#92400e' : '#991b1b' }}>{recommendation.kStatus}</p>
                          </div>
                      </div>

                      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 font-inter">ADVISORY PROTOCOL:</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">" {recommendation.advisory} "</p>
                      </div>
                   </div>
                )}
                
                {!recommendation.error && (
                  <div className="flex gap-4 p-4 print:hidden">
                    <button onClick={() => saveRecord('json')} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-3xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm">Save Record (JSON)</button>
                    <button onClick={() => saveRecord('text')} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-3xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm">Export Report (Text File)</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FarmForm;
