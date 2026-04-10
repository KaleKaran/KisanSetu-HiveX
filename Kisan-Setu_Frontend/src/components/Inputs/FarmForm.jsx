import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sprout, MapPin, Calendar, CheckCircle2, Loader2, Sparkles, Droplets, FlaskConical, RefreshCw, Zap } from 'lucide-react';

const FarmForm = () => {
  const { t, getRecommendation, recommendation, setRecommendation, randomizeSensors, saveRecord } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '',
    growthStage: '',
    soilType: '',
  });

  const handleRandomize = () => {
    randomizeSensors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cropType || !formData.growthStage || !formData.soilType) {
      alert('Please select Crop Type, Growth Stage, and Soil Type before generating synthesis.');
      return;
    }
    setLoading(true);
    setRecommendation(null);
    // Randomize sensors before each prediction to simulate fresh IoT scan
    randomizeSensors();
    setTimeout(async () => {
      const result = await getRecommendation(formData);
      setLoading(false);
    }, 2000);
  };

  const crops = ['crop_wheat', 'crop_rice', 'crop_maize', 'crop_cotton', 'crop_potato', 'crop_sugarcane', 'crop_tomato'];
  const stages = ['stage_sowing', 'stage_vegetative', 'stage_flowering', 'stage_harvest'];
  const soils = ['soil_clay', 'soil_sandy', 'soil_loamy', 'soil_silt'];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-kisan-green-50 dark:bg-kisan-green-950/20 text-kisan-green-600 dark:text-kisan-green-400 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 shadow-sm border border-kisan-green-100 dark:border-kisan-green-900/10">
          <RefreshCw className="w-4 h-4" />
          IoT Field Simulation
        </div>
        <h2 className="text-5xl font-black font-outfit tracking-tighter text-slate-800 dark:text-white uppercase mb-4 leading-none">
          Environmental <span className="text-kisan-green-600">Protocol</span>
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase mb-12">
          Executing high-precision resource allocation mapping based on real-time field sensor telemetry.
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
                    <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600">
                        <Sparkles className="w-4 h-4 text-kisan-green-600" />
                      </div>
                      <span className="leading-none">GENERATE SYNTHESIS</span>
                    </div>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="px-8 py-5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 font-bold text-[10px] uppercase tracking-widest hover:border-kisan-green-400 transition-all flex items-center gap-3 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Random Scan
                </button>
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
                       <div className="p-5 rounded-2xl shadow-md transition-all border-2" 
                            style={{ 
                              backgroundColor: recommendation.phValue < 5 ? '#EF4444' : recommendation.phValue < 6 ? '#FFCE20' : recommendation.phValue < 7.2 ? '#10B981' : recommendation.phValue < 8 ? '#059669' : '#0EA5E9',
                              borderColor: 'rgba(0,0,0,0.1)'
                            }}>
                          <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Soil pH</p>
                          <p className="text-sm font-black text-slate-900">{recommendation.phStatus}</p>
                       </div>
                       
                       <div className="p-5 rounded-2xl shadow-md transition-all" style={{ backgroundColor: recommendation.nStatus === 'LOW' ? '#FFCE20' : recommendation.nStatus === 'HIGH' ? '#EF4444' : '#10B981' }}>
                          <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Nitrogen Status</p>
                          <p className="text-sm font-black text-slate-900">{recommendation.nStatus}</p>
                       </div>
                       
                       <div className="p-5 rounded-2xl shadow-md transition-all" style={{ backgroundColor: recommendation.pStatus === 'LOW' ? '#FFCE20' : recommendation.pStatus === 'HIGH' ? '#EF4444' : '#10B981' }}>
                          <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Phosphorus Status</p>
                          <p className="text-sm font-black text-slate-900">{recommendation.pStatus}</p>
                       </div>
                       
                       <div className="p-5 rounded-2xl shadow-md transition-all" style={{ backgroundColor: recommendation.kStatus === 'LOW' ? '#FFCE20' : recommendation.kStatus === 'HIGH' ? '#EF4444' : '#10B981' }}>
                          <p className="text-[8px] font-black text-slate-900/40 uppercase tracking-widest mb-2">Potassium Status</p>
                          <p className="text-sm font-black text-slate-900">{recommendation.kStatus}</p>
                       </div>
                    </div>

                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 font-inter">ADVISORY PROTOCOL:</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">" {recommendation.advisory} "</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 p-4 print:hidden">
                   <button 
                     onClick={() => saveRecord('json')}
                     className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-3xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                   >
                     Save Record (JSON)
                   </button>
                   <button 
                     onClick={() => saveRecord('text')}
                     className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-3xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                   >
                     Export Report (Text File)
                   </button>
                 </div>

                 {/* HIDDEN PRINT REPORT */}
                 <div className="hidden print:block p-10 bg-white min-h-screen text-slate-900">
                    <div className="border-b-4 border-kisan-green-600 pb-4 mb-8 flex justify-between items-end">
                       <div>
                         <h1 className="text-4xl font-black uppercase tracking-tighter">Kisan-Setu Report</h1>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Field Intelligence Synthesis</p>
                       </div>
                       <p className="text-[10px] font-mono text-slate-300">{new Date().toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-10">
                       <section>
                          <h2 className="text-[10px] font-black uppercase text-kisan-green-600 tracking-widest mb-4 border-b pb-2">01 Field Identification</h2>
                          <div className="space-y-3">
                             <div className="flex justify-between border-b border-slate-50 py-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Crop Selected:</span>
                                <span className="text-xs font-black uppercase">{t(recommendation.farmInfo.cropType)}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-50 py-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Growth Stage:</span>
                                <span className="text-xs font-black uppercase">{t(recommendation.farmInfo.growthStage)}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-50 py-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Soil Type:</span>
                                <span className="text-xs font-black uppercase">{t(recommendation.farmInfo.soilType)}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-50 py-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Irrigation Access:</span>
                                <span className="text-xs font-black uppercase">Standard Ground Access</span>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h2 className="text-[10px] font-black uppercase text-kisan-green-600 tracking-widest mb-4 border-b pb-2">02 Field Telemetry</h2>
                          <div className="space-y-2">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-2 bg-slate-50 border border-slate-100 rounded" style={{ backgroundColor: recommendation.nStatus === 'LOW' ? '#FEF3C7' : recommendation.nStatus === 'HIGH' ? '#FEE2E2' : '#D1FAE5' }}>
                                   <p className="text-[8px] font-black text-slate-400 uppercase">Nitrogen</p>
                                   <p className="text-xs font-black text-slate-900">{recommendation.sensorDetails.n} mg/kg - {recommendation.nStatus}</p>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-100 rounded" style={{ backgroundColor: recommendation.pStatus === 'LOW' ? '#FEF3C7' : recommendation.pStatus === 'HIGH' ? '#FEE2E2' : '#D1FAE5' }}>
                                   <p className="text-[8px] font-black text-slate-400 uppercase">Phosphorus</p>
                                   <p className="text-xs font-black text-slate-900">{recommendation.sensorDetails.p} mg/kg - {recommendation.pStatus}</p>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-100 rounded" style={{ backgroundColor: recommendation.kStatus === 'LOW' ? '#FEF3C7' : recommendation.kStatus === 'HIGH' ? '#FEE2E2' : '#D1FAE5' }}>
                                   <p className="text-[8px] font-black text-slate-400 uppercase">Potassium</p>
                                   <p className="text-xs font-black text-slate-900">{recommendation.sensorDetails.k} mg/kg - {recommendation.kStatus}</p>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                                   <p className="text-[8px] font-black text-slate-400 uppercase">pH Level</p>
                                   <p className="text-xs font-black text-slate-900">{recommendation.sensorDetails.ph} - {recommendation.phStatus}</p>
                                </div>
                             </div>
                          </div>
                       </section>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-3xl mb-10">
                       <h2 className="text-[10px] font-black uppercase text-kisan-green-400 tracking-widest mb-4">03 Synthesis Recommendation</h2>
                       <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                          <div>
                             <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Target Fertilizer</p>
                             <p className="text-3xl font-black uppercase">{recommendation.fertilizer}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Recommended Dosage</p>
                             <p className="text-xl font-black text-kisan-green-400 uppercase">{recommendation.dosage}</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                       <p className="text-[10px] font-black uppercase tracking-widest mb-2">Advisory Note:</p>
                       <p className="text-xs font-bold leading-relaxed">" {recommendation.advisory} "</p>
                    </div>

                    <div className="mt-12 text-center">
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Generated by Kisan-Setu AI Field Synthesis Engine</p>
                    </div>
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
