import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mic, X, Waves, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceAssistant = () => {
  const { t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const toggleListen = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 3000);
      }, 4000);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-[100] flex flex-col items-end gap-6 group">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-6 p-8 bg-slate-900 border border-slate-800 text-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center space-y-8 w-[350px] relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24" />
             </div>
             
             <div className="p-6 bg-kisan-green-600 rounded-full shadow-lg shadow-kisan-green-500/20 relative">
                <div className="absolute inset-0 bg-kisan-green-500 rounded-full animate-ping opacity-20"></div>
                <Mic className="w-8 h-8 relative z-10" />
             </div>
             
             <div className="text-center space-y-3 relative z-10">
                <h4 className="text-xl font-black uppercase tracking-tighter">{t('listening')}</h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-[200px]">How can I optimize your Sector 4 field today?</p>
             </div>
             
             <div className="flex gap-1.5 h-12 py-3">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: "easeInOut" }}
                    className="w-1.5 bg-kisan-green-500 rounded-full"
                  />
                ))}
             </div>
          </motion.div>
        )}

        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl flex items-center gap-4 group"
          >
             <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl">
               <MessageSquare className="w-4 h-4" />
             </div>
             <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Updating irrigation schedule...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListen}
        className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 relative ${
          isListening 
            ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-none' 
            : 'bg-kisan-green-500 text-white shadow-kisan-green-200 dark:shadow-none'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isListening ? <X className="w-8 h-8 relative z-10" /> : <Mic className="w-8 h-8 relative z-10" />}
        {!isListening && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-white dark:border-slate-900 group-hover:rotate-12 transition-transform shadow-sm">
            AI
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;
