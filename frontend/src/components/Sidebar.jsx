import { NavLink } from 'react-router-dom';
import {
  IoAirplaneSharp,
  IoChatbubblesOutline,
  IoGitNetworkOutline,
  IoBookOutline,
  IoInformationCircleOutline,
  IoMenuOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: IoChatbubblesOutline, label: 'Chat' },
  { to: '/flow', icon: IoGitNetworkOutline, label: 'Conversation Flow' },
  { to: '/training', icon: IoBookOutline, label: 'Intent Training' },
  { to: '/about', icon: IoInformationCircleOutline, label: 'About' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        id="sidebar-toggle"
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-card text-slate-300 lg:hidden"
        aria-label="Toggle menu"
      >
        {open ? <IoCloseOutline size={22} /> : <IoMenuOutline size={22} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 flex flex-col
                     bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50
                     transition-transform duration-300
                     ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <IoAirplaneSharp className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-tight">Flight Booking</h1>
            <p className="text-[11px] text-blue-400 font-medium">AI Assistant</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                 ${isActive
                   ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                   : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                 }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/40">
          <p className="text-[11px] text-slate-500">
            Powered by <span className="text-blue-400 font-medium">Groq AI</span>
          </p>
        </div>
      </aside>
    </>
  );
}
