import {
  IoAirplaneSharp,
  IoLocationOutline,
  IoCalendarOutline,
  IoCheckmarkDoneOutline,
  IoLayersOutline,
  IoPersonOutline,
} from 'react-icons/io5';

/**
 * Side panel showing the current conversation state and collected slots.
 *
 * @param {Object}  props
 * @param {string}  props.userName
 * @param {string}  props.intent
 * @param {string}  props.destination
 * @param {string}  props.date
 * @param {string}  props.currentStep
 * @param {boolean} props.bookingConfirmed
 */
export default function SlotPanel({ userName, intent, destination, date, currentStep, bookingConfirmed }) {
  const stepLabels = {
    IDLE: 'Ready',
    ASK_DESTINATION: 'Waiting for destination',
    ASK_DATE: 'Waiting for date',
    CONFIRM: 'Waiting for confirmation',
    DONE: 'Booking confirmed',
    GOODBYE: 'Conversation ended',
  };

  const stepColors = {
    IDLE: 'text-slate-400',
    ASK_DESTINATION: 'text-amber-400',
    ASK_DATE: 'text-amber-400',
    CONFIRM: 'text-blue-400',
    DONE: 'text-emerald-400',
    GOODBYE: 'text-slate-400',
  };

  const items = [
    {
      icon: IoPersonOutline,
      label: 'Passenger',
      value: userName || '—',
      color: userName ? 'text-indigo-400 font-semibold' : 'text-slate-500',
    },
    {
      icon: IoLayersOutline,
      label: 'Intent',
      value: intent || '—',
      color: intent === 'BOOK_FLIGHT' ? 'text-blue-400' : 'text-slate-400',
    },
    {
      icon: IoLocationOutline,
      label: 'Destination',
      value: destination || '—',
      color: destination ? 'text-cyan-400' : 'text-slate-500',
    },
    {
      icon: IoCalendarOutline,
      label: 'Date',
      value: date || '—',
      color: date ? 'text-cyan-400' : 'text-slate-500',
    },
    {
      icon: IoCheckmarkDoneOutline,
      label: 'Status',
      value: stepLabels[currentStep] || currentStep,
      color: stepColors[currentStep] || 'text-slate-400',
    },
  ];

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <IoAirplaneSharp className="text-blue-400" />
        Slot Information
      </h3>

      <div className="space-y-2.5">
        {items.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-start gap-2.5">
            <Icon className="text-slate-500 mt-0.5 flex-shrink-0" size={15} />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
              <p className={`text-sm font-medium truncate ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {bookingConfirmed && (
        <div className="mt-3 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-xs font-semibold text-emerald-400">✅ Booking Confirmed</p>
        </div>
      )}
    </div>
  );
}
