import { useState, useCallback } from 'react';
import ChatWindow from '../components/ChatWindow';
import SlotPanel from '../components/SlotPanel';
import ConversationFlow from '../components/ConversationFlow';

/**
 * Main chat page — chat window + side panels for slots & flow.
 */
export default function ChatPage() {
  const [state, setState] = useState({
    userName: null,
    intent: null,
    destination: null,
    date: null,
    currentStep: 'IDLE',
    bookingConfirmed: false,
  });

  const handleStateChange = useCallback((newState) => {
    setState(newState);
  }, []);

  return (
    <div className="h-[calc(100vh-1rem)] lg:h-screen flex flex-col lg:flex-row gap-4 p-4 lg:pl-0">
      {/* Chat Window */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col min-h-0">
        <ChatWindow onStateChange={handleStateChange} />
      </div>

      {/* Side Panels */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4 overflow-y-auto pb-4">
        <SlotPanel
          userName={state.userName}
          intent={state.intent}
          destination={state.destination}
          date={state.date}
          currentStep={state.currentStep}
          bookingConfirmed={state.bookingConfirmed}
        />
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Conversation Flow
          </h3>
          <ConversationFlow currentStep={state.currentStep} compact />
        </div>
      </div>
    </div>
  );
}
