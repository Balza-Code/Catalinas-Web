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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-[1px]" onClick={onClose}>
      <div className="bg-gray-50 rounded-lg shadow-lg p-6 w-full max-w-lg relative animate-fade-in flex flex-col" onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="h6 text-gray-600 mb-4">{title}</h2>}

        {children ? (
          <div className="space-y-4">{children}</div>
        ) : (
          <div className="text-sm text-gray-700 mb-4">{message}</div>
        )}

        {!children && (
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
              {confirmText}
            </button>
          </div>
        )}

        {children && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>
        )}
      </div>
    </div>
  );
}
