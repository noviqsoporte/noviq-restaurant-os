import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="toast flex items-center gap-3" style={{
      borderColor: type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
    }}>
      {type === 'success' ? (
        <CheckCircle size={18} className="text-green-400 shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-red-400 shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
}
