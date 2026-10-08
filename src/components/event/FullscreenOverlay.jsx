import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function FullscreenOverlay({ title, onClose, children }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button onClick={onClose} aria-label="Close fullscreen" className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs text-mist hover:text-chalk hover:bg-panel-raised">
          <X size={14} /> Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-5">{children}</div>
    </div>
  );
}