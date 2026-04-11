import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Lock, ArrowRight, Shield, Smartphone, Sprout, UserPlus } from 'lucide-react';
import FarmPlanBuilder from './FarmPlanBuilder';
import { API_BASE } from '../../config/api';

const LoginPage = ({ onAuthenticated }) => {
  const [view, setView] = useState('roles');
  const [authTab, setAuthTab] = useState('signin');
  const [roleChoice, setRoleChoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [signIn, setSignIn] = useState({ username: '', password: '' });
  const [signUp, setSignUp] = useState({
    username: '',
    password: '',
    display_name: '',
    panchayat_code: '',
    sector: '',
    area: '',
  });

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signIn.username.trim(),
          password: signIn.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onAuthenticated({ token: data.token, user: data.user });
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const r = roleChoice;
    if (!r) {
      setError('Select a role first.');
      setLoading(false);
      return;
    }
    try {
      const body = {
        username: signUp.username.trim(),
        password: signUp.password,
        display_name: signUp.display_name.trim() || signUp.username.trim(),
        role: r === 'gp_officer' ? 'gp_officer' : 'farmer',
        panchayat_code: r === 'gp_officer' ? signUp.panchayat_code.trim() : signUp.panchayat_code.trim() || undefined,
        sector: signUp.sector.trim(),
        area: signUp.area.trim(),
      };
      if (r === 'gp_officer' && !body.panchayat_code) {
        setError('Panchayat code is required for Gram Panchayat signup.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      onAuthenticated({ token: data.token, user: data.user });
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-kisan-green-200/20 rounded-full blur-3xl -translate-x-48 -translate-y-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl translate-x-48 translate-y-48" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-kisan-green-100 rounded-2xl shadow-sm border border-kisan-green-200/50">
              <span className="text-4xl">🌱</span>
            </div>
          </div>
          <h1 className="text-5xl font-black font-outfit tracking-tighter text-slate-800 uppercase leading-none">
            KISAN <span className="text-kisan-green-600">SETU</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs tracking-[0.3em] uppercase mt-3">
            Sign in or create an account — then choose Simulation or Live on the dashboard
          </p>
        </div>

        {view === 'roles' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setRoleChoice('farmer'); setView('auth'); setAuthTab('signin'); }}
                className="bg-white p-10 rounded-[3rem] shadow-lg border border-slate-100 text-left group hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-kisan-green-100/30 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="p-4 bg-kisan-green-50 text-kisan-green-600 w-fit rounded-2xl mb-8 shadow-inner">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3 font-outfit">Farmer</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
                    Smart-device dashboard: field telemetry and AI fertilizer synthesis.
                  </p>
                  <div className="flex items-center gap-2 text-kisan-green-600 font-black text-xs uppercase tracking-widest">
                    <Sprout className="w-4 h-4" />
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setRoleChoice('gp_officer'); setView('auth'); setAuthTab('signin'); }}
                className="bg-gradient-to-br from-kisan-green-600 to-emerald-700 p-10 rounded-[3rem] shadow-lg border border-kisan-green-500/50 text-left group hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="p-4 bg-white/15 text-white w-fit rounded-2xl mb-8 shadow-inner">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 font-outfit">Gram Panchayat</h3>
                  <p className="text-kisan-green-100/70 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
                    Register farmers without smart devices and run sector-wide recommendations.
                  </p>
                  <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                    <Shield className="w-4 h-4" />
                    <span>Officer access</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10"
            >
              <FarmPlanBuilder />
            </motion.div>
          </>
        )}

        {view === 'auth' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-kisan-green-50 text-kisan-green-600 rounded-2xl">
                    {roleChoice === 'gp_officer' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                      {roleChoice === 'gp_officer' ? 'Gram Panchayat' : 'Farmer'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {authTab === 'signin' ? 'Sign in' : 'Create account'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setView('roles'); setError(''); }}
                  className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
                >
                  ← Roles
                </button>
              </div>

              <div className="flex rounded-2xl bg-slate-100 p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    authTab === 'signin' ? 'bg-white shadow text-kisan-green-700' : 'text-slate-500'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    authTab === 'signup' ? 'bg-white shadow text-kisan-green-700' : 'text-slate-500'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign up
                </button>
              </div>

              {authTab === 'signin' ? (
                <form onSubmit={submitLogin} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Username</label>
                    <input
                      value={signIn.username}
                      onChange={(e) => setSignIn({ ...signIn, username: e.target.value })}
                      className="mt-1 w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                      placeholder="your_username"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                      <Lock className="w-3 h-3" /> Password
                    </label>
                    <input
                      type="password"
                      value={signIn.password}
                      onChange={(e) => setSignIn({ ...signIn, password: e.target.value })}
                      className="mt-1 w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                  {error && <p className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-3 rounded-xl">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-kisan-green-600 hover:bg-kisan-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-60"
                  >
                    {loading ? '…' : 'Enter dashboard'}
                  </button>
                </form>
              ) : (
                <form onSubmit={submitRegister} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Username</label>
                    <input
                      value={signUp.username}
                      onChange={(e) => setSignUp({ ...signUp, username: e.target.value })}
                      className="mt-1 w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                      required
                      minLength={3}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Display name</label>
                    <input
                      value={signUp.display_name}
                      onChange={(e) => setSignUp({ ...signUp, display_name: e.target.value })}
                      className="mt-1 w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Password (min 4)</label>
                    <input
                      type="password"
                      value={signUp.password}
                      onChange={(e) => setSignUp({ ...signUp, password: e.target.value })}
                      className="mt-1 w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                      required
                      minLength={4}
                    />
                  </div>
                  {roleChoice === 'gp_officer' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Panchayat code</label>
                      <input
                        value={signUp.panchayat_code}
                        onChange={(e) => setSignUp({ ...signUp, panchayat_code: e.target.value })}
                        className="mt-1 w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                        placeholder="e.g. SATARA-GP-01"
                        required
                      />
                    </div>
                  )}
                  {roleChoice === 'farmer' && (
                    <>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Panchayat (optional)</label>
                        <input
                          value={signUp.panchayat_code}
                          onChange={(e) => setSignUp({ ...signUp, panchayat_code: e.target.value })}
                          className="mt-1 w-full px-5 py-3 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-transparent focus:border-kisan-green-500 outline-none"
                          placeholder="Link to your GP"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sector</label>
                          <input
                            value={signUp.sector}
                            onChange={(e) => setSignUp({ ...signUp, sector: e.target.value })}
                            className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-2xl font-bold text-xs border-2 border-transparent focus:border-kisan-green-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Area</label>
                          <input
                            value={signUp.area}
                            onChange={(e) => setSignUp({ ...signUp, area: e.target.value })}
                            className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-2xl font-bold text-xs border-2 border-transparent focus:border-kisan-green-500 outline-none"
                            placeholder="Ha"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {error && <p className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-3 rounded-xl">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-kisan-green-600 hover:bg-kisan-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-60"
                  >
                    {loading ? '…' : 'Create account'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
