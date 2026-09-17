import {
  IoAirplaneSharp,
  IoCodeSlash,
  IoServerOutline,
  IoBulb,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoGitBranch,
} from 'react-icons/io5';

const FEATURES = [
  {
    icon: IoBulb,
    title: 'Intent Recognition',
    desc: 'Uses Groq LLM to classify user messages into intents like BOOK_FLIGHT, GREETING, GOODBYE, and more.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: IoGitBranch,
    title: 'Slot Filling',
    desc: 'Extracts destination and date entities from natural language. Asks only for missing information.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: IoServerOutline,
    title: 'Conversation State',
    desc: 'Maintains session state server-side. Tracks intent, slots, and conversation step per session.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: 'Secure Architecture',
    desc: 'API key stored in backend .env only. Never exposed to the frontend. Input validation with Pydantic.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: IoFlashOutline,
    title: 'Fast AI Inference',
    desc: 'Powered by Groq for ultra-fast LLM inference. Model configurable via environment variable.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: IoCodeSlash,
    title: 'Clean Architecture',
    desc: 'React + Vite frontend with Tailwind CSS. FastAPI backend with clean separation of concerns.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
];

const TECH_STACK = [
  { category: 'Frontend', items: ['React 18', 'Vite 5', 'Tailwind CSS 3', 'React Router', 'React Icons'] },
  { category: 'Backend', items: ['Python', 'FastAPI', 'Pydantic', 'Uvicorn'] },
  { category: 'AI', items: ['Groq API', 'LLaMA 3.1 (configurable)'] },
  { category: 'Config', items: ['python-dotenv', '.env files'] },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen p-4 lg:pl-0">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 pt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-900/40 mb-2">
            <IoAirplaneSharp className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">AI Flight Booking Bot</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            A production-style conversational AI chatbot demonstrating intent recognition,
            slot filling, conversation state management, and transactional dialogue design.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="glass-card-hover p-5 space-y-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                <Icon className={color} size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TECH_STACK.map(({ category, items }) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-xs text-slate-400">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-200">Architecture Overview</h2>
          <div className="flex flex-col md:flex-row items-center gap-4 text-center">
            {[
              { label: 'React Frontend', sub: 'Port 5173', color: 'from-cyan-500 to-blue-600' },
              { label: 'FastAPI Backend', sub: 'Port 8000', color: 'from-emerald-500 to-green-600' },
              { label: 'Groq LLM API', sub: 'Cloud AI', color: 'from-violet-500 to-purple-600' },
            ].map(({ label, sub, color }, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`px-5 py-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-[10px] text-white/70">{sub}</p>
                </div>
                {i < 2 && (
                  <span className="text-slate-500 text-lg hidden md:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Example Conversation */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-200">Example Conversation</h2>
          <div className="space-y-2 text-sm">
            {[
              { role: 'Bot', msg: "Hello! I'm your AI Flight Booking Assistant. ✈️ How can I help you?", color: 'text-blue-400' },
              { role: 'User', msg: 'I want to book a flight.', color: 'text-slate-300' },
              { role: 'Bot', msg: 'Sure! ✈️ Where would you like to go?', color: 'text-blue-400' },
              { role: 'User', msg: 'Dubai', color: 'text-slate-300' },
              { role: 'Bot', msg: 'Great choice! 📅 What date would you like to travel to Dubai?', color: 'text-blue-400' },
              { role: 'User', msg: 'September 25', color: 'text-slate-300' },
              { role: 'Bot', msg: '✈️ You want to book a flight to Dubai on September 25. Is that correct?', color: 'text-blue-400' },
              { role: 'User', msg: 'Yes, confirm', color: 'text-slate-300' },
              { role: 'Bot', msg: '🎉 Your flight to Dubai on September 25 has been confirmed!', color: 'text-emerald-400' },
            ].map(({ role, msg, color }, i) => (
              <div key={i} className="flex gap-3">
                <span className={`font-mono text-xs w-10 flex-shrink-0 ${color}`}>{role}:</span>
                <span className="text-slate-400">{msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-slate-500">
            Built with ❤️ using React, FastAPI, and Groq AI
          </p>
        </div>
      </div>
    </div>
  );
}
