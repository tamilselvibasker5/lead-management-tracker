import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose }) {
  const icons = {
    success: <CheckCircle2 size={18} className="toast__icon toast__icon--success" />,
    error: <AlertCircle size={18} className="toast__icon toast__icon--error" />,
    info: <Info size={18} className="toast__icon toast__icon--info" />,
  };

  return (
    <div className={`toast toast--${type}`}>
      {icons[type] || icons.info}
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
}
