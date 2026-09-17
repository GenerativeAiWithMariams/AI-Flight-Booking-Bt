import { IoAirplaneSharp } from 'react-icons/io5';

/**
 * Animated typing indicator (three bouncing dots) shown while waiting for the bot.
 */
export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mt-1">
        <IoAirplaneSharp className="text-white text-xs" />
      </div>
      <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce-dot-1" />
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce-dot-2" />
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce-dot-3" />
      </div>
    </div>
  );
}
