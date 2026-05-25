import React, { useEffect } from 'react';

export default function Modal({ open = true, title, message, onClose = () => {}, confirmText = 'OK', children }) {
  if (!open) return null;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 p-0 md:p-4 md:items-center" onClick={onClose}>
      <div className="relative z-60 w-full h-full bg-white md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-2xl overflow-y-auto p-4 pb-28 md:p-6 md:pb-6" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>}

        {children ? (
          <div className="space-y-4">{children}</div>
        ) : (
          <div className="text-sm text-slate-700 mb-4">{message}</div>
        )}

        {!children && (
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
              {confirmText}
            </button>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 rounded-full bg-slate-100 p-3 text-slate-600 shadow-sm hover:bg-slate-200">✕</button>
      </div>
    </div>
  );
}
