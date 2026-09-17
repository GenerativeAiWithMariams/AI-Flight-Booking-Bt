import ConversationFlow from '../components/ConversationFlow';
import { IoGitNetworkOutline } from 'react-icons/io5';

/**
 * Full-page conversation flow visualization.
 */
export default function FlowPage() {
  return (
    <div className="min-h-screen p-4 lg:pl-0">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <IoGitNetworkOutline size={14} />
            Visual Flow
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Conversation Flow</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            This diagram shows the complete conversational flow of the AI Flight Booking Bot,
            from greeting to confirmation.
          </p>
        </div>

        {/* Flow */}
        <ConversationFlow currentStep="IDLE" />

        {/* Legend */}
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Legend</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-slate-300">Active Step</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-300">Completed Step</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-300">Pending Step</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">How It Works</h3>
          <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
            <p>
              <strong className="text-slate-300">1. Start & Greeting:</strong> The bot greets the user and waits for input.
            </p>
            <p>
              <strong className="text-slate-300">2. Intent Recognition:</strong> The user's message is sent to the Groq LLM,
              which classifies the intent (BOOK_FLIGHT, GREETING, GOODBYE, etc.) and extracts entities.
            </p>
            <p>
              <strong className="text-slate-300">3. Slot Filling:</strong> If the intent is BOOK_FLIGHT, the bot checks
              for missing slots (destination, date) and asks only for what's needed.
            </p>
            <p>
              <strong className="text-slate-300">4. Confirmation:</strong> Once all slots are filled, the bot presents a
              summary and asks the user to confirm or cancel.
            </p>
            <p>
              <strong className="text-slate-300">5. Completion:</strong> The booking is confirmed or cancelled,
              and the user can start a new conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
