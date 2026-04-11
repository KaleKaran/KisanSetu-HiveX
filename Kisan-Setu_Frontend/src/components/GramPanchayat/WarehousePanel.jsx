import React, { useEffect, useState, useCallback } from 'react';
import { Database, Layers, RefreshCw, Loader2, GitBranch } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Loads warehouse snapshot — respects Simulation vs Live (X-Data-Mode).
 */
const WarehousePanel = () => {
  const { dataMode, apiJson, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [snap, setSnap] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [mRes, wRes] = await Promise.all([
        fetch(`${API_BASE}/api/mode`),
        apiJson('/api/warehouse'),
      ]);
      if (!mRes.ok || !wRes.ok) throw new Error('Warehouse API unavailable');
      const m = await mRes.json();
      const w = await wRes.json();
      setSnap({ modeMeta: m, warehouse: w });
    } catch (e) {
      setErr(e.message || 'Failed to load');
      setSnap(null);
    } finally {
      setLoading(false);
    }
  }, [apiJson]);

  useEffect(() => {
    load();
  }, [load, dataMode, session?.token]);

  const warehouse = snap?.warehouse;
  const dims = warehouse?.dimensions;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              Data warehouse
              <GitBranch className="w-4 h-4 text-slate-300" />
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Star fact + snowflake location (panchayat → sector → farmer)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {warehouse && (
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                warehouse.data_mode === 'live'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {warehouse.data_mode === 'live' ? 'Live rows only' : 'Simulation + demo facts'}
            </span>
          )}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      <div className="p-8">
        {loading && !snap && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading dimensional model…
          </div>
        )}
        {err && (
          <p className="text-sm text-rose-600 font-bold">
            {err} — start the Flask backend on port 5000.
          </p>
        )}
        {warehouse && dims && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Panchayats', dims.panchayats?.length],
                ['Sectors', dims.sectors?.length],
                ['Farmers (dims)', dims.farmers?.length],
                ['Facts (filtered)', warehouse.facts?.length],
              ].map(([label, n]) => (
                <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{n ?? 0}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Dimension tables
                </h4>
                <ul className="text-xs space-y-2 text-slate-600 font-mono bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-48 overflow-y-auto">
                  <li>dim_crop ({dims.crops?.length})</li>
                  <li>dim_soil ({dims.soils?.length})</li>
                  <li>dim_growth_stage ({dims.growth_stages?.length})</li>
                  <li>dim_fertilizer ({dims.fertilizers?.length})</li>
                  <li>dim_time ({dims.time?.length})</li>
                  <li className="text-indigo-700">dim_panchayat → dim_sector → dim_farmer</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Recent facts (recommendation grain)
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-48 overflow-auto text-[10px] font-mono">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-100/90 text-slate-500 uppercase text-[8px]">
                      <tr>
                        <th className="p-2">id</th>
                        <th className="p-2">crop</th>
                        <th className="p-2">fert</th>
                        <th className="p-2">mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(warehouse.facts || []).slice(0, 8).map((f) => (
                        <tr key={f.id} className="border-t border-slate-100">
                          <td className="p-2 text-slate-500">{f.id}</td>
                          <td className="p-2">{f.crop_id}</td>
                          <td className="p-2">{f.fertilizer_id}</td>
                          <td className="p-2">{f.app_mode_at_write || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {warehouse.telemetry_recent?.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Telemetry (last events)
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">
                  {warehouse.telemetry_recent.slice(0, 3).map((t) => t.message).join(' · ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehousePanel;
