import { useEffect } from "react";

const Modal = ({ title, children, onClose }) => {
  // Cierra con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título */}
        <h2 className="h6 text-gray-600 mb-4">{title}</h2>

        {/* Contenido */}
        <div className="space-y-4">{children}</div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Modal;
