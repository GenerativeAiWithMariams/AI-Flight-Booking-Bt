import { IoAirplaneSharp } from 'react-icons/io5';

/**
 * Render a single message bubble in the chat.
 *
 * @param {Object} props
 * @param {'user'|'bot'} props.role
 * @param {string} props.content
 * @param {string} props.timestamp
 */
export default function MessageBubble({ role, content, timestamp }) {
  const isBot = role === 'bot';

  // Simple markdown-bold renderer: **text** → <strong>text</strong>
  const renderContent = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {/* Bot avatar */}
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mt-1">
          <IoAirplaneSharp className="text-white text-xs" />
        </div>
      )}

      <div className={`max-w-[75%] ${isBot ? '' : 'order-first flex justify-end w-full'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed msg-content
            ${isBot
              ? 'bg-slate-800/70 border border-slate-700/50 text-slate-200 rounded-bl-md'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-lg shadow-blue-900/20'
            }`}
        >
          {renderContent(content)}
        </div>
        {timestamp && (
          <p className={`text-[10px] text-slate-500 mt-1 ${isBot ? 'ml-1' : 'mr-1 text-right'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
