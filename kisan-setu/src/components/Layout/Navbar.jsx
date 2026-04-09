import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Globe, Mic, Search } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useApp();

  return (
    <nav className="fixed top-0 right-0 left-0 h-20 glass z-50 px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="lg:hidden p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
          <Search className="w-6 h-6" />
        </div>
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 gap-2 w-96">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search farm records..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm">
          {['en', 'hi', 'mr'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                language === lang 
                  ? 'bg-kisan-green-500 text-white' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:scale-110 transition-transform active:scale-95 border dark:border-slate-700"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
        </button>

        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-kisan-green-400 to-emerald-600 border-2 border-white shadow-lg cursor-pointer hover:rotate-6 transition-transform"></div>
      </div>
    </nav>
  );
};

export default Navbar;
