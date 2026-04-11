import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import WarehousePanel from './WarehousePanel';
import DataModeToggle from '../Layout/DataModeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MapPin, Sprout, FlaskConical, Droplets, Thermometer, Wind, 
  CheckCircle2, Loader2, Sparkles, Download, ChevronRight,
  Search, Database, RefreshCw, Plus, Trash2
} from 'lucide-react';

// Generic farmer labels with unique sensor data from IoT field deployments
const createFarmers = () => [
  { 
    id: 'F001', name: 'Farmer 1', sector: 'Sector 1 - North', area: '2.5 Hectares',
    sensors: { n: 85, p: 42, k: 65, ph: 6.8, moisture: 38, temp: 26, humidity: 58, rainfall: 1100 }
  },
  { 
    id: 'F002', name: 'Farmer 2', sector: 'Sector 2 - East', area: '1.8 Hectares',
    sensors: { n: 120, p: 28, k: 45, ph: 5.5, moisture: 62, temp: 30, humidity: 75, rainfall: 1800 }
  },
  { 
    id: 'F003', name: 'Farmer 3', sector: 'Sector 3 - West', area: '3.2 Hectares',
    sensors: { n: 45, p: 68, k: 30, ph: 7.8, moisture: 22, temp: 34, humidity: 42, rainfall: 650 }
  },
  { 
    id: 'F004', name: 'Farmer 4', sector: 'Sector 4 - South', area: '1.5 Hectares',
    sensors: { n: 95, p: 55, k: 88, ph: 6.2, moisture: 48, temp: 28, humidity: 65, rainfall: 1400 }
  },
  { 
    id: 'F005', name: 'Farmer 5', sector: 'Sector 1 - South', area: '4.0 Hectares',
    sensors: { n: 60, p: 35, k: 110, ph: 7.2, moisture: 55, temp: 32, humidity: 70, rainfall: 2200 }
  },
];

const crops = ['crop_wheat', 'crop_rice', 'crop_maize', 'crop_cotton', 'crop_potato', 'crop_sugarcane', 'crop_tomato'];
const stages = ['stage_sowing', 'stage_vegetative', 'stage_flowering', 'stage_harvest'];
const soils = ['soil_clay', 'soil_sandy', 'soil_loamy', 'soil_silt'];

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

const randomBetween = (min, max, decimals = 1) => {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
};

const GPDashboard = ({ operator, onLogout }) => {
  const { t } = useApp();
  const { dataMode, apiJson } = useAuth();
  const isLive = dataMode === 'live';
  const [farmers, setFarmers] = useState(createFarmers);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gpRecommendation, setGpRecommendation] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [newFarmer, setNewFarmer] = useState({ name: '', sector: '', area: '' });

  const [farmerInput, setFarmerInput] = useState({
    cropType: '',
    growthStage: '',
    soilType: ''
  });
  const [saving, setSaving] = useState(false);

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (dataMode !== 'live') {
      setFarmers(createFarmers());
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiJson('/api/gp/registrations');
        const j = await res.json();
        if (cancelled || !res.ok) return;
        const mapped = (j.farmers || []).map((f) => ({
          id: f.id,
          name: f.name,
          sector: f.sector,
          area: f.area,
          sensors: { ...f.sensors },
          db_id: f.db_id,
        }));
        setFarmers(mapped);
      } catch {
        if (!cancelled) setFarmers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataMode, apiJson]);

  const handleAddFarmer = async () => {
    if (!newFarmer.name || !newFarmer.sector || !newFarmer.area) {
      alert("Please fill all details including Area...");
      return;
    }
    setSaving(true);
    try {
      if (dataMode === 'live') {
      const body = {
        name: newFarmer.name.trim(),
        sector: newFarmer.sector.trim(),
        area: newFarmer.area.trim(),
        n: 0,
        p: 0,
        k: 0,
        ph: 0,
        moisture: 0,
        temp: 0,
        humidity: 0,
        rainfall: 0,
        notes: 'Awaiting first IoT device sync — initial field profile.',
      };
      const res = await apiJson('/api/gp/registrations', { method: 'POST', body: JSON.stringify(body) });
      const row = await res.json();
      if (!res.ok) {
        alert(row.error || 'Could not save farmer');
        return;
      }
      setFarmers((prev) => [
        {
          id: row.id,
          name: row.name,
          sector: row.sector,
          area: row.area,
          sensors: { ...row.sensors },
          db_id: row.db_id,
        },
        ...prev,
      ]);
      setNewFarmer({ name: '', sector: '', area: '' });
      setShowAddFarmer(false);
        return;
      }
    } finally {
      setSaving(false);
    }
    const newId = `F${String(farmers.length + 1).padStart(3, '0')}`;
    const newF = {
      id: newId,
      name: newFarmer.name,
      sector: newFarmer.sector,
      area: newFarmer.area.toLowerCase().includes('hectare') ? newFarmer.area : `${newFarmer.area} Hectares`,
      sensors: {
        n: randomBetween(20, 159, 1),
        p: randomBetween(10, 89, 1),
        k: randomBetween(10, 119, 1),
        ph: randomBetween(4.5, 8.5, 1),
        moisture: randomBetween(10, 85, 1),
        temp: randomBetween(10, 45, 1),
        humidity: randomBetween(20, 95, 1),
        rainfall: randomBetween(500, 3000, 1)
      }
    };
    setFarmers([newF, ...farmers]);
    setNewFarmer({ name: '', sector: '', area: '' });
    setShowAddFarmer(false);
  };

  const handleSelectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    setGpRecommendation(null);
    setFarmerInput({ cropType: '', growthStage: '', soilType: '' });
  };

  // Live Sync — simulation only: randomizes sensor values
  const handleLiveSync = () => {
    if (dataMode === 'live') {
      alert('Live mode uses stored field readings. Add or re-register a farmer to update values.');
      return;
    }
    if (!selectedFarmer) return;
    setSyncing(true);
    const newSensors = {
      n: randomBetween(20, 159, 1),
      p: randomBetween(10, 89, 1),
      k: randomBetween(10, 119, 1),
      ph: randomBetween(4.5, 8.5, 1),
      moisture: randomBetween(10, 85, 1),
      temp: randomBetween(10, 45, 1),
      humidity: randomBetween(20, 95, 1),
      rainfall: randomBetween(500, 3000, 1)
    };
    // Update the farmer in the list
    setFarmers(prev => prev.map(f => f.id === selectedFarmer.id ? { ...f, sensors: newSensors } : f));
    setSelectedFarmer(prev => ({ ...prev, sensors: newSensors }));
    setGpRecommendation(null);
    setTimeout(() => setSyncing(false), 600);
  };

  const handleRandomScan = () => {
    if (dataMode === 'live') {
      alert('Random scan is available in Simulation mode only.');
      return;
    }
    if (!selectedFarmer) return;
    const newSensors = {
      n: randomBetween(20, 159, 1),
      p: randomBetween(10, 89, 1),
      k: randomBetween(10, 119, 1),
      ph: randomBetween(4.5, 8.5, 1),
      moisture: randomBetween(10, 85, 1),
      temp: randomBetween(10, 45, 1),
      humidity: randomBetween(20, 95, 1),
      rainfall: randomBetween(500, 3000, 1)
    };
    setFarmers(prev => prev.map(f => f.id === selectedFarmer.id ? { ...f, sensors: newSensors } : f));
    setSelectedFarmer(prev => ({ ...prev, sensors: newSensors }));
    setFarmerInput({
      cropType: crops[Math.floor(Math.random() * crops.length)],
      growthStage: stages[Math.floor(Math.random() * stages.length)],
      soilType: soils[Math.floor(Math.random() * soils.length)]
    });
    setGpRecommendation(null);
  };

  const handleDeleteFarmer = async (e, farmer) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete record for ${farmer.name}?`)) return;
    
    if (dataMode === 'live') {
      try {
        const res = await apiJson(`/api/gp/registrations/${farmer.db_id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
      } catch (err) {
        alert('Server error: Could not delete farmer');
        return;
      }
    }
    
    setFarmers(prev => prev.filter(f => f.id !== farmer.id));
    if (selectedFarmer?.id === farmer.id) setSelectedFarmer(null);
  };

  const handleGenerateForFarmer = async () => {
    if (!selectedFarmer) return;
    if (!farmerInput.cropType || !farmerInput.growthStage || !farmerInput.soilType) {
      alert('Please select Crop Type, Growth Stage, and Soil Type as told by the farmer.');
      return;
    }
    
    setLoading(true);
    setGpRecommendation(null);

    try {
      const cropMap = { 
        'crop_wheat': 'Wheat', 'crop_rice': 'Rice', 'crop_maize': 'Maize', 
        'crop_cotton': 'Cotton', 'crop_potato': 'Potato', 'crop_sugarcane': 'Sugarcane', 
        'crop_tomato': 'Tomato' 
      };
      const soilMap = { 
        'soil_clay': 'Clay', 'soil_sandy': 'Sandy', 'soil_loamy': 'Loamy', 'soil_silt': 'Silt' 
      };
      const stageMap = { 
        'stage_sowing': 'Sowing', 'stage_vegetative': 'Vegetative', 
        'stage_flowering': 'Flowering', 'stage_harvest': 'Harvest' 
      };

      const s = selectedFarmer.sensors;
      const response = await apiJson('/predict', {
        method: 'POST',
        body: JSON.stringify({
          soil_type: soilMap[farmerInput.soilType],
          soil_ph: s.ph,
          soil_moisture: s.moisture,
          nitrogen: s.n,
          phosphorus: s.p,
          potassium: s.k,
          temperature: s.temp,
          humidity: s.humidity,
          rainfall: s.rainfall,
          crop_type: cropMap[farmerInput.cropType],
          growth_stage: stageMap[farmerInput.growthStage],
          panchayat_code: operator?.panchayat,
          panchayat_name: operator?.panchayat,
          sector_label: selectedFarmer?.sector,
          farmer_external_id: selectedFarmer?.id,
          farmer_name: selectedFarmer?.name,
        }),
      });

      if (!response.ok) throw new Error('Backend synthesis failed');
      const data = await response.json();

      setGpRecommendation({
        farmerName: selectedFarmer.name,
        sector: selectedFarmer.sector,
        cropType: farmerInput.cropType,
        growthStage: farmerInput.growthStage,
        soilType: farmerInput.soilType,
        fertilizer: data.predicted_fertilizer,
        dosage: data.recommended_dosage,
        advisory: data.advisory,
        phStatus: data.ph_status.toUpperCase(),
        nStatus: data.nitrogen_status.toUpperCase(),
        pStatus: data.phosphorus_status.toUpperCase(),
        kStatus: data.potassium_status.toUpperCase(),
        sensorDetails: s
      });
    } catch (error) {
      console.error('GP Recommendation Error:', error);
      setGpRecommendation({ fertilizer: 'Error: Backend unreachable', dosage: 'N/A' });
    }
    setLoading(false);
  };

  const handleExportFarmerReport = () => {
    if (!gpRecommendation || !selectedFarmer) return;
    const s = selectedFarmer.sensors;
    const reportContent = `
=========================================
KISAN-SETU: GRAM PANCHAYAT REPORT
=========================================
Operator: ${operator.name} (${operator.id})
Panchayat: ${operator.panchayat}
Timestamp: ${new Date().toLocaleString()}

01 FARMER IDENTIFICATION
-----------------------------------------
Farmer: ${selectedFarmer.name}
Sector: ${selectedFarmer.sector}
Field Area: ${selectedFarmer.area}
Crop Type: ${t(gpRecommendation.cropType).toUpperCase()}
Growth Stage: ${t(gpRecommendation.growthStage).toUpperCase()}
Soil Type: ${t(gpRecommendation.soilType).toUpperCase()}

02 FIELD SENSOR DATA
-----------------------------------------
Nitrogen (N): ${s.n} mg/kg [${gpRecommendation.nStatus}]
Phosphorus (P): ${s.p} mg/kg [${gpRecommendation.pStatus}]
Potassium (K): ${s.k} mg/kg [${gpRecommendation.kStatus}]
Soil pH: ${s.ph} [${gpRecommendation.phStatus}]
Moisture: ${s.moisture}%
Temperature: ${s.temp}°C
Humidity: ${s.humidity}%
Rainfall: ${s.rainfall} mm

03 AI RECOMMENDATION
-----------------------------------------
TARGET FERTILIZER: ${gpRecommendation.fertilizer}
RECOMMENDED DOSAGE: ${gpRecommendation.dosage}

ADVISORY:
"${gpRecommendation.advisory}"

-----------------------------------------
Generated by Kisan-Setu • Gram Panchayat Module
=========================================`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GP_Report_${selectedFarmer.name.replace(/\s/g, '_')}_${Date.now()}.txt`;
    a.click();
    alert(`Report generated for ${selectedFarmer.name} (Text File).`);
  };

  const getStatusColor = (status) => {
    if (status === 'LOW') return '#FFCE20';
    if (status === 'HIGH') return '#EF4444';
    return '#10B981';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Top Bar — GREEN themed */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-kisan-green-100 rounded-xl">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <h1 className="text-lg font-black font-outfit tracking-tighter text-slate-800 uppercase leading-none">
              KISAN <span className="text-kisan-green-600">SETU</span>
            </h1>
            <p className="text-[8px] font-bold text-kisan-green-600 uppercase tracking-[0.2em]">Gram Panchayat Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-wrap justify-end">
          <DataModeToggle />
          <div className="text-right">
            <p className="text-xs font-black text-slate-800 uppercase">{operator.name}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{operator.panchayat}</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-28 px-8 pb-12 flex gap-8 max-w-[1600px] mx-auto">
        {/* Left Panel — Farmer List */}
        <div className="w-96 flex-shrink-0">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-kisan-green-50 text-kisan-green-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Farmer Records</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {farmers.length} {dataMode === 'live' ? 'In database' : 'Demo farms'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddFarmer(!showAddFarmer)}
                className="p-2.5 bg-kisan-green-50 text-kisan-green-600 hover:bg-kisan-green-500 hover:text-white rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {showAddFarmer && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 overflow-hidden"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Farmer Details</p>
                  <input
                    type="text"
                    placeholder="Farmer Name"
                    value={newFarmer.name}
                    onChange={(e) => setNewFarmer({...newFarmer, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white rounded-xl text-xs font-bold border border-slate-200 focus:border-kisan-green-400 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Sector / Location"
                    value={newFarmer.sector}
                    onChange={(e) => setNewFarmer({...newFarmer, sector: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white rounded-xl text-xs font-bold border border-slate-200 focus:border-kisan-green-400 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Area (in Hectares)"
                    value={newFarmer.area}
                    onChange={(e) => setNewFarmer({...newFarmer, area: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white rounded-xl text-xs font-bold border border-slate-200 focus:border-kisan-green-400 outline-none"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowAddFarmer(false)}
                      className="flex-1 py-2.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddFarmer}
                      disabled={saving}
                      className="flex-1 py-3 bg-kisan-green-600 text-white hover:bg-kisan-green-700 disabled:bg-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or sector..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold border-2 border-transparent focus:border-kisan-green-400 outline-none transition-all"
              />
            </div>

            {dataMode === 'live' && farmers.length === 0 && (
              <p className="text-[10px] font-bold text-slate-500 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                No farmers in the database yet. Use <span className="text-kisan-green-700">+</span> to register someone who visited your panchayat without a smartphone.
              </p>
            )}
            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
              {filteredFarmers.map((farmer) => (
                <motion.div
                  key={farmer.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectFarmer(farmer)}
                  className={`w-full p-5 rounded-2xl text-left transition-all border-2 cursor-pointer relative group ${
                    selectedFarmer?.id === farmer.id 
                      ? 'bg-kisan-green-600 text-white border-kisan-green-600 shadow-xl' 
                      : 'bg-slate-50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-black uppercase tracking-tight ${selectedFarmer?.id === farmer.id ? 'text-white' : 'text-slate-800'}`}>
                        {farmer.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className={`w-3 h-3 ${selectedFarmer?.id === farmer.id ? 'text-white/70' : 'text-slate-400'}`} />
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedFarmer?.id === farmer.id ? 'text-white/70' : 'text-slate-400'}`}>
                          {farmer.sector}
                        </p>
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${selectedFarmer?.id === farmer.id ? 'text-white/60' : 'text-slate-300'}`}>
                        {farmer.area}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <button
                         onClick={(e) => handleDeleteFarmer(e, farmer)}
                         className={`p-1.5 rounded-lg transition-colors ${selectedFarmer?.id === farmer.id ? 'hover:bg-white/20 text-white/50 hover:text-white' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'}`}
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                       <ChevronRight className={`w-4 h-4 ${selectedFarmer?.id === farmer.id ? 'text-white' : 'text-slate-300'}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            {!selectedFarmer ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-100/50 border-4 border-dashed border-slate-200 p-20 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="p-8 bg-white rounded-full shadow-inner">
                  <Users className="w-12 h-12 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Select a Farmer</h3>
                  <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-2 px-10">
                    Choose a farmer from the left panel to view their field sensor data and generate AI recommendations.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedFarmer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Farmer Header — GREEN, not dark */}
                <div className="bg-gradient-to-r from-kisan-green-600 to-emerald-700 p-10 rounded-[3rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-kisan-green-200 uppercase tracking-[0.3em] mb-2">Farmer Profile</p>
                      <h2 className="text-3xl font-black font-outfit uppercase tracking-tight">{selectedFarmer.name}</h2>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{selectedFarmer.sector}</span>
                        <span className="text-[10px] font-bold text-white/40">•</span>
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{selectedFarmer.area}</span>
                      </div>
                    </div>
                    {/* Live Sync + Random Scan buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleLiveSync}
                        className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Live Sync'}
                      </button>
                      {!isLive && (
                        <button
                          onClick={handleRandomScan}
                          className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          <Sparkles className="w-4 h-4" />
                          Random Scan
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sensor Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Nitrogen', value: selectedFarmer.sensors.n, unit: 'mg/kg', icon: Sprout, color: 'emerald' },
                    { label: 'Phosphorus', value: selectedFarmer.sensors.p, unit: 'mg/kg', icon: FlaskConical, color: 'amber' },
                    { label: 'Potassium', value: selectedFarmer.sensors.k, unit: 'mg/kg', icon: FlaskConical, color: 'blue' },
                    { label: 'Soil pH', value: selectedFarmer.sensors.ph, unit: 'pH', icon: Droplets, color: 'purple' },
                    { label: 'Moisture', value: selectedFarmer.sensors.moisture, unit: '%', icon: Droplets, color: 'blue' },
                    { label: 'Temperature', value: selectedFarmer.sensors.temp, unit: '°C', icon: Thermometer, color: 'orange' },
                    { label: 'Humidity', value: selectedFarmer.sensors.humidity, unit: '%', icon: Wind, color: 'teal' },
                    { label: 'Rainfall', value: selectedFarmer.sensors.rainfall, unit: 'mm', icon: Droplets, color: 'sky' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <s.icon className={`w-4 h-4 text-${s.color}-500`} />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                      </div>
                      <p className="text-2xl font-black text-slate-800 tracking-tight">
                        {s.value} <span className="text-[10px] font-bold text-slate-400">{s.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Operator Input Form */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-kisan-green-50 text-kisan-green-600 rounded-2xl">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Farmer Input</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enter details as told by the farmer</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Sprout className="w-3 h-3" /> Crop Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {crops.map(crop => (
                          <button
                            key={crop}
                            onClick={() => setFarmerInput({...farmerInput, cropType: crop})}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                              farmerInput.cropType === crop 
                                ? 'bg-kisan-green-500 text-white border-kisan-green-500 shadow-md' 
                                : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {t(crop)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Database className="w-3 h-3" /> Growth Stage
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {stages.map(stage => (
                          <motion.div 
                            key={stage} 
                            className="relative"
                            whileHover="hover"
                            initial="initial"
                          >
                            <button
                              onClick={() => setFarmerInput({...farmerInput, growthStage: stage})}
                              className={`px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                                farmerInput.growthStage === stage 
                                  ? 'bg-kisan-green-500 text-white border-kisan-green-500 shadow-md' 
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              {t(stage)}
                            </button>
                            <motion.div
                              variants={{
                                initial: { opacity: 0, y: 10, scale: 0.95, pointerEvents: "none" },
                                hover: { opacity: 1, y: 0, scale: 1, pointerEvents: "none", transition: { type: "spring", stiffness: 400, damping: 25 } }
                              }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-xl z-50 flex flex-col items-center"
                            >
                              <p className="text-[11px] font-bold text-center w-full leading-relaxed">{stageInfo[stage]}</p>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-200"></div>
                              <div className="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Soil Type
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {soils.map(soil => (
                          <motion.div 
                            key={soil} 
                            className="relative"
                            whileHover="hover"
                            initial="initial"
                          >
                            <button
                              onClick={() => setFarmerInput({...farmerInput, soilType: soil})}
                              className={`px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border-2 ${
                                farmerInput.soilType === soil 
                                  ? 'bg-kisan-green-500 text-white border-kisan-green-500 shadow-md' 
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              {t(soil)}
                            </button>
                            <motion.div
                              variants={{
                                initial: { opacity: 0, y: 10, scale: 0.95, pointerEvents: "none" },
                                hover: { opacity: 1, y: 0, scale: 1, pointerEvents: "none", transition: { type: "spring", stiffness: 400, damping: 25 } }
                              }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-36 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 flex flex-col items-center"
                            >
                              <img src={soilImages[soil]} alt={soil} className="w-full aspect-square object-cover rounded-xl border border-slate-100" />
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-200"></div>
                              <div className="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateForFarmer}
                    disabled={loading}
                    className="w-full mt-8 py-5 bg-kisan-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-kisan-green-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Recommendation...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Recommendation
                      </>
                    )}
                  </button>
                </div>

                {/* Recommendation Result */}
                {gpRecommendation && gpRecommendation.fertilizer && !gpRecommendation.fertilizer.includes('Error') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-slate-50 p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                          Recommendation <span className="text-kisan-green-600">Ready</span>
                        </h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          For {gpRecommendation.farmerName} • {gpRecommendation.sector} • {t(gpRecommendation.cropType)} ({t(gpRecommendation.growthStage)})
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-kisan-green-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Fertilizer</p>
                        <p className="text-xl font-black text-slate-800">{gpRecommendation.fertilizer}</p>
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Dosage</p>
                        <p className="text-xl font-black text-kisan-green-600">{gpRecommendation.dosage}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: gpRecommendation.phStatus?.includes('ACIDIC') ? '#EF4444' : gpRecommendation.phStatus?.includes('ALKALINE') ? '#0EA5E9' : '#10B981' }}>
                        <p className="text-[7px] font-black text-slate-900/40 uppercase tracking-widest mb-1">Soil pH</p>
                        <p className="text-xs font-black text-slate-900">{gpRecommendation.phStatus}</p>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: getStatusColor(gpRecommendation.nStatus) }}>
                        <p className="text-[7px] font-black text-slate-900/40 uppercase tracking-widest mb-1">Nitrogen</p>
                        <p className="text-xs font-black text-slate-900">{gpRecommendation.nStatus}</p>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: getStatusColor(gpRecommendation.pStatus) }}>
                        <p className="text-[7px] font-black text-slate-900/40 uppercase tracking-widest mb-1">Phosphorus</p>
                        <p className="text-xs font-black text-slate-900">{gpRecommendation.pStatus}</p>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: getStatusColor(gpRecommendation.kStatus) }}>
                        <p className="text-[7px] font-black text-slate-900/40 uppercase tracking-widest mb-1">Potassium</p>
                        <p className="text-xs font-black text-slate-900">{gpRecommendation.kStatus}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Advisory Protocol</p>
                      <p className="text-xs font-bold text-slate-600 italic leading-relaxed">"{gpRecommendation.advisory}"</p>
                    </div>

                    <button
                      onClick={handleExportFarmerReport}
                      className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                    >
                      <Download className="w-4 h-4" />
                      Export Report for {selectedFarmer.name} (Text File)
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <WarehousePanel />
        </div>
      </div>
    </div>
  );
};

export default GPDashboard;
