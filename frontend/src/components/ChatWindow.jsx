import { useState, useRef, useEffect, useCallback } from 'react';
import { IoSend, IoRefreshOutline } from 'react-icons/io5';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ConfirmationButtons from './ConfirmationButtons';
import { sendMessage, resetSession, generateSessionId } from '../services/api';

const INITIAL_BOT_MESSAGE = {
  role: 'bot',
  content: "Hello! I'm your AI Flight Booking Assistant. ✈️ How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

/**
 * Main chat window component.
 *
 * @param {Object}   props
 * @param {Function} props.onStateChange  Called whenever conversation state updates
 */
export default function ChatWindow({ onStateChange }) {
  const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [currentStep, setCurrentStep] = useState('IDLE');
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const updateState = useCallback(
    (data) => {
      setCurrentStep(data.current_step);
      onStateChange?.({
        userName: data.user_name || data.slots?.user_name,
        intent: data.intent,
        destination: data.slots?.destination,
        date: data.slots?.date,
        currentStep: data.current_step,
        bookingConfirmed: data.booking_confirmed,
      });
    },
    [onStateChange]
  );

  const handleSend = useCallback(
    async (text) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      setInput('');
      setError(null);

      const userMsg = {
        role: 'user',
        content: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const data = await sendMessage(sessionId, msg);
        const botMsg = {
          role: 'bot',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        updateState(data);
      } catch (err) {
        setError('Failed to reach the server. Make sure the backend is running on port 8000.');
        const errorMsg = {
          role: 'bot',
          content: "I'm sorry, I couldn't connect to the server right now. Please make sure the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, sessionId, updateState]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    try {
      await resetSession(sessionId);
    } catch {
      // Ignore reset errors
    }
    const newId = generateSessionId();
    setSessionId(newId);
    setMessages([{ ...INITIAL_BOT_MESSAGE, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setCurrentStep('IDLE');
    setError(null);
    onStateChange?.({ userName: null, intent: null, destination: null, date: null, currentStep: 'IDLE', bookingConfirmed: false });
    inputRef.current?.focus();
  };

  const showConfirmButtons = currentStep === 'CONFIRM' && !loading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/40">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">AI Flight Assistant</h2>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Online
          </p>
        </div>
        <button
          id="btn-new-chat"
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          title="New Chat"
        >
          <IoRefreshOutline size={14} />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}

        {loading && <TypingIndicator />}

        {showConfirmButtons && (
          <ConfirmationButtons
            onConfirm={() => handleSend('Yes, confirm')}
            onCancel={() => handleSend('No, cancel')}
            disabled={loading}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-3 border-t border-slate-700/40">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all
                       disabled:opacity-50"
          />
          <button
            id="btn-send"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                       hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            <IoSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
