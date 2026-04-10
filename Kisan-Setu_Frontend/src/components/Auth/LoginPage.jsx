import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Lock, ArrowRight, Shield, Smartphone } from 'lucide-react';
import FarmPlanBuilder from './FarmPlanBuilder';

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [gpCredentials, setGpCredentials] = useState({ operatorId: '', password: '' });
  const [error, setError] = useState('');

  const validOperators = [
    { id: 'ADMIN', password: 'kisan2026', name: 'Admin', panchayat: 'Satara Gram Panchayat' },
  ];

  const handleFarmerLogin = () => {
    onLogin('farmer', { name: 'Farmer', role: 'farmer' });
  };

  const handleGPLogin = (e) => {
    e.preventDefault();
    const operator = validOperators.find(
      op => op.id === gpCredentials.operatorId.toUpperCase() && op.password === gpCredentials.password
    );
    if (operator) {
      setError('');
      onLogin('gp_operator', operator);
    } else {
      setError('Invalid Operator ID or Password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-kisan-green-200/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-kisan-green-100 rounded-2xl shadow-sm border border-kisan-green-200/50">
              <span className="text-4xl">🌱</span>
            </div>
          </div>
          <h1 className="text-5xl font-black font-outfit tracking-tighter text-slate-800 uppercase leading-none">
            KISAN <span className="text-kisan-green-600">SETU</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs tracking-[0.3em] uppercase mt-3">
            Smart Agriculture • AI-Powered Recommendations
          </p>
        </div>

        {/* Role Selection */}
        {!selectedRole && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {/* Farmer Card */}
            <motion.button
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFarmerLogin}
              className="bg-white p-10 rounded-[3rem] shadow-lg border border-slate-100 text-left group hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-kisan-green-100/30 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="p-4 bg-kisan-green-50 text-kisan-green-600 w-fit rounded-2xl mb-8 shadow-inner">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3 font-outfit">
                  Farmer Login
                </h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
                  Access your personal farm dashboard with AI-driven insights and recommendations.
                </p>
                <div className="flex items-center gap-2 text-kisan-green-600 font-black text-xs uppercase tracking-widest">
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.button>

            {/* Gram Panchayat Card — GREEN theme */}
            <motion.button
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('gp_operator')}
              className="bg-gradient-to-br from-kisan-green-600 to-emerald-700 p-10 rounded-[3rem] shadow-lg border border-kisan-green-500/50 text-left group hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="p-4 bg-white/15 text-white w-fit rounded-2xl mb-8 shadow-inner">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 font-outfit">
                  Gram Panchayat
                </h3>
                <p className="text-kisan-green-100/70 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
                  Operator login for managing multiple farmer records and generating sector-wise reports.
                </p>
                <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                  <span>Operator Access</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Farm Plan Builder always shows on landing page when role is not selected */}
        {!selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FarmPlanBuilder />
          </motion.div>
        )}

        {/* GP Login Form */}
        {selectedRole === 'gp_operator' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-kisan-green-50 text-kisan-green-600 rounded-2xl">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Operator Login</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gram Panchayat Access Portal</p>
                </div>
              </div>

              <form onSubmit={handleGPLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Operator ID
                  </label>
                  <input
                    type="text"
                    value={gpCredentials.operatorId}
                    onChange={(e) => setGpCredentials({...gpCredentials, operatorId: e.target.value.toUpperCase()})}
                    placeholder="e.g. ADMIN"
                    className="w-full px-6 py-4 bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={gpCredentials.password}
                    onChange={(e) => setGpCredentials({...gpCredentials, password: e.target.value})}
                    placeholder="Enter password"
                    className="w-full px-6 py-4 bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none transition-all"
                  />
                </div>

                {error && (
                  <p className="text-rose-500 text-xs font-bold uppercase tracking-widest text-center bg-rose-50 p-3 rounded-xl">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-5 bg-kisan-green-600 hover:bg-kisan-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-kisan-green-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Authenticate & Enter
                </button>
              </form>

              <button
                onClick={() => { setSelectedRole(null); setError(''); }}
                className="w-full mt-4 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                ← Back to Role Selection
              </button>

              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Demo Credentials: <span className="text-slate-600">ADMIN</span> / <span className="text-slate-600">kisan2026</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
