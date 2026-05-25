import React from 'react';
import { Search, Bell, Mail, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopBarProps {
  title?: string;
  onProfileClick: () => void;
  onMenuClick?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  onProfileClick, 
  onMenuClick,
  showSearch = true, 
  onSearch, 
  searchQuery 
}) => {
  return (
    <header className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between items-center mb-8">
      <div className="flex items-center gap-4 w-full lg:max-w-xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-95"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex-1">
          {showSearch ? (
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search task" 
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pl-16 pr-14 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all placeholder:text-slate-300"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase">
                <span className="text-xs">⌘</span> F
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-6">
        <div className="flex items-center gap-2">
          <button className="p-3 text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-2xl transition-all relative">
            <Mail size={22} strokeWidth={1.5} />
          </button>
          <button className="p-3 text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-2xl transition-all relative">
            <Bell size={22} strokeWidth={1.5} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
        
        <div 
          onClick={onProfileClick}
          className="flex items-center gap-3 p-1.5 pr-4 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full border-2 border-white shadow-md overflow-hidden transition-transform group-active:scale-95">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&auto=format&fit=crop" 
              className="w-full h-full rounded-full object-cover" 
              alt="Profile" 
            />
          </div>
          <div className="hidden sm:block">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">Alex Chen</h4>
            <p className="text-[10px] text-slate-400 font-medium">alex.chen@evergrow.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
