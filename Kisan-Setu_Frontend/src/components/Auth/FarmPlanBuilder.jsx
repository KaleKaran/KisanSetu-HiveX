import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Smartphone, Sunset, Cloud, CheckCircle2, RotateCcw, Calculator } from 'lucide-react';

const FarmPlanBuilder = () => {
  const [step, setStep] = useState(0); // 0: Start, 1: Q1, 2: Path A (Q1.1), 3: Path B (Q2), 4: Path B (Q3), 5: Result
  const [answers, setAnswers] = useState({
    hasSmartphone: null, // Yes / No
    smsUpdate: null,     // True / False
    powerCuts: null,     // Yes / No
    cloudFeatures: null  // Yes / No
  });

  const baseSetupCost = 5378; // ESP32 Controller (₹378) + TP-Link Router (₹5000)

  const handleStart = () => setStep(1);

  const calculateCosts = () => {
    let oneTime = baseSetupCost;
    let monthly = 0;

    if (answers.powerCuts === 'Yes') {
      oneTime += 136466; // 5kWh Battery, 2.2kW Solar, Hybrid Inverter kit & BOS
    }

    if (answers.hasSmartphone === 'No') {
      if (answers.smsUpdate) monthly += 225; // SIM pack + SMS gateway average costs
    } else if (answers.hasSmartphone === 'Yes') {
      if (answers.cloudFeatures === 'Yes') monthly += 1112; // AWS EC2, RDS, S3 hosting and AI processing average
    }
    return { oneTime, monthly };
  };

  const reset = () => {
    setAnswers({ hasSmartphone: null, smsUpdate: null, powerCuts: null, cloudFeatures: null });
    setStep(1);
  };

  const { oneTime, monthly } = calculateCosts();

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Build Your Farm Plan</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Get a recommended hardware setup & cost estimate</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="text-center py-10"
          >
            <p className="text-slate-500 font-bold mb-8">Answer a few simple questions to find out exactly what equipment your farm needs, without any technical jargon.</p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200"
            >
              Start Plan Builder
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-black text-slate-800">Do you have a Smartphone or Laptop, or a basic 2G-type Phone?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { setAnswers({...answers, hasSmartphone: 'Yes'}); setStep(3); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-sm uppercase">Smartphone / Laptop</span>
                </div>
                <p className="text-xs text-slate-500">I can use apps or a web browser to view visual data.</p>
              </button>
              <button
                onClick={() => { setAnswers({...answers, hasSmartphone: 'No'}); setStep(2); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-sm uppercase">2G / Basic Phone</span>
                </div>
                <p className="text-xs text-slate-500">I can only receive simple text messages or need to visit the Panchayat.</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-black text-slate-800">How would you like to receive your Farm Recommendations and Alerts?</h4>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setAnswers({...answers, smsUpdate: true}); setStep(3); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all"
              >
                <span className="font-bold text-sm block mb-1">Automated SMS updates directly on my phone</span>
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded mt-2">+₹225 / month (SIM & SMS Service)</span>
              </button>
              <button
                onClick={() => { setAnswers({...answers, smsUpdate: false}); setStep(3); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all"
              >
                <span className="font-bold text-sm block mb-1">Visit the Gram Panchayat office to view updates</span>
                <span className="inline-block px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded mt-2">Free of cost</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-black text-slate-800">Does your Region face frequent Power Cuts or Unstable Electricity?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { setAnswers({...answers, powerCuts: 'Yes'}); setStep(answers.hasSmartphone === 'Yes' ? 4 : 5); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all flex flex-col items-start"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sunset className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-sm uppercase">Yes, fails frequently</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3 mt-1">
                  Include solar panels with the kit.
                </p>
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded mt-auto">+₹1,36,466 for Full Solar/Battery Kit</span>
              </button>
              <button
                onClick={() => { setAnswers({...answers, powerCuts: 'No'}); setStep(answers.hasSmartphone === 'Yes' ? 4 : 5); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all flex flex-col items-start"
              >
                <span className="font-bold text-sm uppercase block mb-1">No, power is stable</span>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3 mt-1">
                  Standard power adapters included.
                </p>
                <span className="inline-block px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded mt-auto">No additional cost</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h4 className="text-lg font-black text-slate-800">Would you like to have Remote Access and Advanced Features?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { setAnswers({...answers, cloudFeatures: 'Yes'}); setStep(5); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Cloud className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-sm uppercase">Yes, I want Cloud Services</span>
                </div>
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed mb-3 mt-1">
                  Remote Access and Features:<br/>
                  <span className="text-slate-500 font-normal">
                    (1. Disease Analysis, 2. Crop Recommendation, 3. Yield Prediction, 4. Weather Reports, 5. Voice Assistant)
                  </span>
                </p>
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded mt-auto">+₹1,112 / month (Standard Tier Cloud)</span>
              </button>
              <button
                onClick={() => { setAnswers({...answers, cloudFeatures: 'No'}); setStep(5); }}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl text-left transition-all flex flex-col items-start"
              >
                <span className="font-bold text-sm uppercase block mb-1">No, keep it basic</span>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3 mt-1">
                  Basic real-time updates for fertilizer recommendation and irrigation guidance.
                </p>
                <span className="inline-block px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded mt-auto">Basic plan is included</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-8 rounded-[2rem] text-white flex flex-col items-center justify-center text-center shadow-xl">
              <CheckCircle2 className="w-12 h-12 mb-4 text-indigo-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Your Recommended Plan Cost</p>
              <h2 className="text-5xl font-black mb-2">₹{oneTime.toLocaleString()}</h2>
              <p className="text-xs font-bold text-indigo-200">One-time Fixed Setup</p>
              
              {monthly > 0 && (
                <div className="mt-4 px-4 py-2 bg-white/20 rounded-xl">
                  <span className="text-sm font-black text-white">+ ₹{monthly.toLocaleString()} / month</span>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-3 items-center">
                  <div>
                    <span className="text-sm font-bold text-slate-600 block">Base Setup & Field Equipment</span>
                    <span className="text-[10px] font-bold text-slate-400">(Fixed one-time cost, but may need occasional maintenance)</span>
                  </div>
                  <span className="text-sm font-black">
                    ₹{baseSetupCost.toLocaleString()}
                  </span>
                </div>
                {answers.hasSmartphone === 'No' && answers.smsUpdate && (
                  <div className="flex justify-between border-b border-slate-200 pb-3 items-center">
                    <span className="text-sm font-bold text-slate-600">SMS Alert Service</span>
                    <span className="text-sm font-black">₹225 / mo</span>
                  </div>
                )}
                {answers.powerCuts === 'Yes' && (
                  <div className="flex justify-between border-b border-slate-200 pb-3 items-center">
                    <span className="text-sm font-bold text-slate-600">Solar Power Grid (Professional)</span>
                    <span className="text-sm font-black">₹1,36,466</span>
                  </div>
                )}
                {answers.hasSmartphone === 'Yes' && answers.cloudFeatures === 'Yes' && (
                  <div className="flex justify-between border-b border-slate-200 pb-3 items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600">Cloud & AI Service Subscription</span>
                      <span className="text-[10px] font-bold text-slate-400">(Hosting, Processing & AI features)</span>
                    </div>
                    <span className="text-sm font-black">₹1,112 / mo</span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-sm font-black text-indigo-600 uppercase">Total Initial Cost</span>
                  <span className="text-sm font-black text-indigo-600">₹{oneTime.toLocaleString()}</span>
                </div>
                {monthly > 0 && (
                  <div className="flex justify-between pt-2 border-t border-indigo-100">
                    <span className="text-sm font-black text-indigo-600 uppercase">Monthly Service Cost</span>
                    <span className="text-sm font-black text-indigo-600">₹{monthly.toLocaleString()} / mo</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Recalculate Plan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmPlanBuilder;
