import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';
import DataModeToggle from './DataModeToggle';

const Navbar = () => {
  const { language, setLanguage } = useApp();

  return (
    <nav className="fixed top-0 right-0 left-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm z-50 px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="lg:hidden p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
          <Search className="w-6 h-6" />
        </div>
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 gap-2 w-96">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search farm records..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-end">
        <DataModeToggle />
        <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-slate-100">
          {['en', 'hi', 'mr'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                language === lang 
                  ? 'bg-kisan-green-500 text-white' 
                  : 'hover:bg-slate-100'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
