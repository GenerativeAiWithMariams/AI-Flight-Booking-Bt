import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';

/**
 * Confirm / Cancel buttons shown when the bot asks for booking confirmation.
 *
 * @param {Object} props
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 * @param {boolean}  props.disabled
 */
export default function ConfirmationButtons({ onConfirm, onCancel, disabled = false }) {
  return (
    <div className="flex gap-3 ml-11 animate-slide-up">
      <button
        id="btn-confirm-booking"
        onClick={onConfirm}
        disabled={disabled}
        className="btn-success flex items-center gap-2 text-white disabled:opacity-50"
      >
        <IoCheckmarkCircle size={18} />
        Confirm
      </button>
      <button
        id="btn-cancel-booking"
        onClick={onCancel}
        disabled={disabled}
        className="btn-danger flex items-center gap-2 text-white disabled:opacity-50"
      >
        <IoCloseCircle size={18} />
        Cancel
      </button>
    </div>
  );
}
