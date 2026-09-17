import TrainingExamples from '../components/TrainingExamples';
import { useNavigate } from 'react-router-dom';
import { IoBookOutline, IoArrowForward } from 'react-icons/io5';

/**
 * Page displaying intent training utterances.
 */
export default function TrainingPage() {
  const navigate = useNavigate();

  const handleSendToChat = (text) => {
    // Navigate to chat page — the user can paste the utterance there
    navigate('/', { state: { prefill: text } });
  };

  return (
    <div className="min-h-screen p-4 lg:pl-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <IoBookOutline size={14} />
            NLU Training Data
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Intent Training Examples</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            These utterances demonstrate the variety of natural language expressions that
            the AI model recognizes as flight booking requests. Hover over any example and
            click the send icon to test it in the chatbot.
          </p>
        </div>

        {/* Info card */}
        <div className="glass-card p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <IoArrowForward className="text-blue-400" size={14} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">About Intent Recognition</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Groq LLM analyzes each user message to classify it into one of several intents:
              <span className="text-blue-400 font-mono"> BOOK_FLIGHT</span>,
              <span className="text-emerald-400 font-mono"> GREETING</span>,
              <span className="text-amber-400 font-mono"> GOODBYE</span>,
              <span className="text-cyan-400 font-mono"> CONFIRM</span>,
              <span className="text-red-400 font-mono"> CANCEL</span>, or
              <span className="text-slate-400 font-mono"> UNKNOWN</span>.
              Along with intent classification, it extracts entities like destination and date.
            </p>
          </div>
        </div>

        {/* Training examples */}
        <div className="glass-card p-5">
          <TrainingExamples onSend={handleSendToChat} />
        </div>
      </div>
    </div>
  );
}
