import {
  IoPlayCircle,
  IoHandLeft,
  IoChatbubbleEllipses,
  IoSearch,
  IoAirplane,
  IoLocation,
  IoCalendar,
  IoCheckmarkCircle,
  IoCheckmarkDone,
  IoCloseCircle,
  IoLogOut,
} from 'react-icons/io5';

const FLOW_STEPS = [
  { id: 'START',           label: 'Start',                icon: IoPlayCircle,        step: null },
  { id: 'GREETING',        label: 'Greeting',             icon: IoHandLeft,          step: 'IDLE' },
  { id: 'USER_MESSAGE',    label: 'User Message',         icon: IoChatbubbleEllipses, step: null },
  { id: 'INTENT',          label: 'Intent Recognition',   icon: IoSearch,            step: null },
  { id: 'BOOK_FLIGHT',     label: 'Book Flight',          icon: IoAirplane,          step: null },
  { id: 'ASK_DESTINATION', label: 'Destination Slot',     icon: IoLocation,          step: 'ASK_DESTINATION' },
  { id: 'ASK_DATE',        label: 'Date Slot',            icon: IoCalendar,          step: 'ASK_DATE' },
  { id: 'CONFIRM',         label: 'Confirmation',         icon: IoCheckmarkCircle,   step: 'CONFIRM' },
  { id: 'DONE',            label: 'Confirmed / Cancelled', icon: IoCheckmarkDone,    step: 'DONE' },
  { id: 'GOODBYE',         label: 'Goodbye',              icon: IoLogOut,            step: 'GOODBYE' },
];

/**
 * Visual conversation flow tree.
 *
 * @param {Object}  props
 * @param {string}  props.currentStep   Current step from the API (e.g. 'ASK_DATE')
 * @param {boolean} props.compact       If true, renders a smaller version for the sidebar
 */
export default function ConversationFlow({ currentStep = 'IDLE', compact = false }) {
  const getNodeState = (node) => {
    if (!currentStep || currentStep === 'IDLE') {
      return node.id === 'START' || node.id === 'GREETING' ? 'active' : 'pending';
    }

    const stepIndex = FLOW_STEPS.findIndex((s) => s.step === currentStep);
    const nodeIndex = FLOW_STEPS.findIndex((s) => s.id === node.id);

    if (node.step === currentStep) return 'active';
    if (nodeIndex < stepIndex) return 'completed';
    return 'pending';
  };

  const stateStyles = {
    active: {
      node: 'border-blue-500 bg-blue-500/20 animate-pulse-glow',
      icon: 'text-blue-400',
      label: 'text-blue-300 font-semibold',
      connector: 'flow-connector-active',
    },
    completed: {
      node: 'border-emerald-500/40 bg-emerald-500/10',
      icon: 'text-emerald-400',
      label: 'text-emerald-400/80',
      connector: 'flow-connector',
    },
    pending: {
      node: 'border-slate-600/40 bg-slate-800/30',
      icon: 'text-slate-500',
      label: 'text-slate-500',
      connector: 'flow-connector',
    },
  };

  return (
    <div className={compact ? '' : 'glass-card p-6'}>
      {!compact && (
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <IoSearch className="text-blue-400" />
          Conversation Flow
        </h3>
      )}

      <div className="flex flex-col items-center">
        {FLOW_STEPS.map((node, i) => {
          const state = getNodeState(node);
          const styles = stateStyles[state];
          const Icon = node.icon;

          return (
            <div key={node.id} className="flex flex-col items-center">
              {/* Node */}
              <div
                className={`flex items-center gap-2.5 border rounded-xl px-3.5 transition-all duration-300
                  ${compact ? 'py-1.5' : 'py-2'}
                  ${styles.node}`}
              >
                <Icon className={styles.icon} size={compact ? 14 : 16} />
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} ${styles.label}`}>
                  {node.label}
                </span>
              </div>

              {/* Connector line */}
              {i < FLOW_STEPS.length - 1 && (
                <div className={`${styles.connector} ${compact ? '!h-4' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
