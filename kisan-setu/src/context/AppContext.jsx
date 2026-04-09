import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [sensorData, setSensorData] = useState({
    n: 45, p: 32, k: 58,
    moisture: 42,
    ph: 6.8,
    temp: 24.5,
    humidity: 62
  });
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'anomaly_moisture' },
    { id: 2, type: 'info', message: 'anomaly_temp' }
  ]);
  const [recommendation, setRecommendation] = useState(null);

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    // Simulate real-time sensor fluctuation
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ...prev,
        moisture: Math.max(0, Math.min(100, prev.moisture + (Math.random() - 0.5) * 2)),
        temp: prev.temp + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 2))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getRecommendation = (farmData) => {
    // Simulated logic
    setTimeout(() => {
      setRecommendation({
        fertilizer: 'Apply 50kg Urea per acre',
        irrigation: 'Increase irrigation by 15%',
        soilHealth: Math.random() > 0.5 ? 'high' : 'medium'
      });
    }, 1500);
  };

  const value = {
    language, setLanguage,
    theme, toggleTheme,
    sensorData, setSensorData,
    alerts, setAlerts,
    recommendation, setRecommendation,
    getRecommendation,
    t
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
