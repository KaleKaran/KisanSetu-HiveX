import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sprout, MapPin, Calendar, CheckCircle2, Loader2, Sparkles, Droplets, FlaskConical } from 'lucide-react';

const FarmForm = () => {
  const { t, getRecommendation, recommendation, setRecommendation } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '',
    growthStage: '',
    soilType: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation(null);
    setTimeout(() => {
      getRecommendation(formData);
      setLoading(false);
    }, 2000);
  };

  const crops = ['crop_wheat', 'crop_rice', 'crop_corn'];
  const stages = ['stage_seedling', 'stage_vegetative', 'stage_flowering'];
  const soils = ['soil_clay', 'soil_sandy', 'soil_loamy'];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-kisan-green-50 dark:bg-kisan-green-950/20 text-kisan-green-600 dark:text-kisan-green-400 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 shadow-sm border border-kisan-green-100 dark:border-kisan-green-900/10">
          <Sparkles className="w-4 h-4" />
          AI Diagnosis Engine
        </div>
        <h2 className="text-5xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white uppercase mb-4 leading-none">
          Optimization <span className="text-kisan-green-600">Protocol</span>
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase mb-12">
          Submit your farm parameters for high-precision resource allocation mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <motion.div 
          layout
          className="lg:col-span-5 space-y-8"
        >
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden">
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2">
                  <Sprout className="w-3 h-3" />
                  {t('crop_type')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {crops.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => setFormData({...formData, cropType: crop})}
                      className={`px-6 py-4 rounded-2xl text-sm font-bold transition-all border-2 text-left flex items-center justify-between group ${
                        formData.cropType === crop 
                        ? 'bg-kisan-green-500 text-white border-kisan-green-500 shadow-lg shadow-kisan-green-200' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {t(crop)}
                      {formData.cropType === crop && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  {t('growth_stage')}
                </label>
                <select 
                  value={formData.growthStage}
                  onChange={(e) => setFormData({...formData, growthStage: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Stage</option>
                  {stages.map(s => <option key={s} value={s}>{t(s)}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase pl-2 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {t('soil_type')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {soils.map((soil) => (
                    <button
                      key={soil}
                      type="button"
                      onClick={() => setFormData({...formData, soilType: soil})}
                      className={`px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                        formData.soilType === soil 
                        ? 'bg-kisan-green-500 text-white border-kisan-green-500 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:bg-white'
                      }`}
                    >
                      {t(soil)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 dark:bg-kisan-green-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Synthesis
                  </>
                )}
              </button>
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
                   <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">Awaiting Input Stream</h3>
                   <p className="text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-widest mt-2 px-10">Configure your parameters to visualize the optimized resource allocation strategy.</p>
                </div>
              </motion.div>
            )}

            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-12 rounded-[4rem] shadow-2xl border border-white dark:border-slate-700/50 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                     <CheckCircle2 className="w-48 h-48" />
                   </div>

                   <div className="mb-12">
                     <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Synthesis <span className="text-kisan-green-600">Complete</span></h3>
                     <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] tracking-[0.25em] uppercase">High Resolution Recommendations generated</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-0">
                      <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                         <div className="p-3 bg-kisan-green-50 dark:bg-kisan-green-500/10 text-kisan-green-600 w-fit rounded-2xl mb-6">
                            <FlaskConical className="w-6 h-6" />
                         </div>
                         <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('fertilizer')}</h4>
                         <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">{recommendation.fertilizer}</p>
                      </div>

                      <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                         <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 w-fit rounded-2xl mb-6">
                            <Droplets className="w-6 h-6" />
                         </div>
                         <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('irrigation')}</h4>
                         <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">{recommendation.irrigation}</p>
                      </div>
                   </div>

                   <div className="mt-8 p-8 bg-kisan-green-500 rounded-[2.5rem] flex items-center justify-between text-white shadow-xl shadow-kisan-green-200 dark:shadow-none translate-y-0 group-hover:-translate-y-1 transition-transform">
                      <div>
                         <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">{t('status')}</p>
                         <h4 className="text-2xl font-black uppercase tracking-tight">Soil Health: {recommendation.soilHealth.toUpperCase()}</h4>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                         <Sprout className="w-8 h-8" />
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-4">
                  <button className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-3xl border dark:border-slate-700 hover:bg-slate-50 transition-all">Save Record</button>
                  <button className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-3xl border dark:border-slate-700 hover:bg-slate-50 transition-all">Export PDF</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FarmForm;
