import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, BarChart2, Bell, Search } from 'lucide-react';

export default function Topbar({ onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="topbar sticky top-0 z-10 flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="white" strokeWidth="1.5"/><path d="M3 6h18" stroke="white" strokeWidth="1.5"/></svg>
          </div>
          <div>
            <div className="text-lg font-extrabold">Rail TMS</div>
            <div className="text-xs text-muted">AI Asset Tracker</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 text-sm text-muted">
          <Link className={`flex items-center px-3 py-2 rounded ${location.pathname === '/' ? 'text-white bg-slate-800' : 'hover:bg-slate-900'}`} to="/"><Home size={16} /> <span className="ml-2">Dashboard</span></Link>
          <Link className={`flex items-center px-3 py-2 rounded ${location.pathname.startsWith('/asset') ? 'text-white bg-slate-800' : 'hover:bg-slate-900'}`} to="/assets"><List size={16} /> <span className="ml-2">Assets</span></Link>
          <Link className={`flex items-center px-3 py-2 rounded ${location.pathname === '/reports' ? 'text-white bg-slate-800' : 'hover:bg-slate-900'}`} to="/reports"><BarChart2 size={16} /> <span className="ml-2">Reports</span></Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {onSearch && (
          <div className="relative hidden sm:block">
            <input onChange={(e) => onSearch(e.target.value)} placeholder="Search UID, vendor, name..." className="bg-gray-900 text-sm rounded-full px-4 py-2 pl-10 outline-none border border-slate-800 w-80" />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        )}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800">
          <Bell size={16} />
          <span className="text-sm">Alerts</span>
        </button>
      </div>
    </header>
  );
}