import { IoSend, IoChatbubbleEllipses } from 'react-icons/io5';

const TRAINING_UTTERANCES = [
  { text: 'I want to book a flight', slots: {} },
  { text: 'Can you book me a flight?', slots: {} },
  { text: 'I need a plane ticket', slots: {} },
  { text: "I'd like to reserve a flight", slots: {} },
  { text: 'Help me book a flight', slots: {} },
  { text: 'I need to travel to Dubai', slots: { destination: 'Dubai' } },
  { text: 'Find me a flight to Dubai', slots: { destination: 'Dubai' } },
  { text: 'I want to make a flight reservation', slots: {} },
  { text: 'Can you help arrange my flight?', slots: {} },
  { text: "I'd like to fly to London", slots: { destination: 'London' } },
  { text: 'Book a ticket for me', slots: {} },
  { text: 'I need an airline reservation', slots: {} },
  { text: 'I want to reserve a plane ticket', slots: {} },
  { text: 'Please help me book a flight', slots: {} },
  { text: 'I need a flight reservation', slots: {} },
  { text: 'I want to fly to Dubai on September 25', slots: { destination: 'Dubai', date: 'September 25' } },
  { text: 'Book a flight to Paris next Monday', slots: { destination: 'Paris', date: 'next Monday' } },
  { text: 'Reserve a ticket to New York tomorrow', slots: { destination: 'New York', date: 'tomorrow' } },
  { text: 'I want to go to Tokyo on March 15', slots: { destination: 'Tokyo', date: 'March 15' } },
  { text: 'Get me a flight to Berlin', slots: { destination: 'Berlin' } },
];

/**
 * Display training utterances for the BOOK_FLIGHT intent.
 *
 * @param {Object}   props
 * @param {Function} props.onSend  Optional — sends an utterance to the chat for testing
 */
export default function TrainingExamples({ onSend }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <IoChatbubbleEllipses className="text-blue-400" size={18} />
        <h3 className="text-sm font-semibold text-slate-300">
          BOOK_FLIGHT Intent — Training Utterances
        </h3>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        These examples demonstrate the variety of natural language expressions that are
        recognized as the <span className="text-blue-400 font-mono">BOOK_FLIGHT</span> intent.
        The AI model classifies all of them correctly and extracts any embedded entities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {TRAINING_UTTERANCES.map(({ text, slots }, i) => (
          <div
            key={i}
            className="glass-card-hover group flex items-center justify-between gap-2 px-4 py-3 cursor-default"
          >
            <div className="min-w-0">
              <p className="text-sm text-slate-300 truncate">"{text}"</p>
              {Object.keys(slots).length > 0 && (
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {Object.entries(slots).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono"
                    >
                      {key}: {val}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {onSend && (
              <button
                onClick={() => onSend(text)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 flex-shrink-0"
                title="Send to chat"
              >
                <IoSend size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
