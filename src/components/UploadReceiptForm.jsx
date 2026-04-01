import { useState } from "react";
import { uploadReceipt } from "../services/orderService";
import { useModal } from "../context/ModalContext";

const UploadReceiptForm = ({ orderId, onReceiptUploaded }) => {
  const [file, setFile] = useState(null);
  const [metodoPago, setMetodoPago] = useState("Transferencia/Pago Móvil");
  const [monedaPago, setMonedaPago] = useState("Bs");
  const [uploading, setUploading] = useState(false);
  const { showModal } = useModal();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (metodoPago !== "Efectivo" && !file) {
      showModal({ title: 'Archivo faltante', message: 'Por favor, selecciona un archivo.' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("metodoPago", metodoPago);

    if (metodoPago === "Efectivo") {
      formData.append("monedaPago", monedaPago);
    } else {
      formData.append("comprobante", file);
    }

    try {
      const updatedOrder = await uploadReceipt(orderId, formData);
      showModal({ 
        title: 'Éxito', 
        message: metodoPago === 'Efectivo' ? '¡Pago en efectivo reportado!' : '¡Comprobante subido!' 
      });
      onReceiptUploaded(updatedOrder);
      
    } catch (error) {
      console.error("Error de red:", error);
      showModal({ title: 'Error', message: 'Error al procesar el pago.' });
    } finally {
      setUploading(false);
    }
  };

  return ( 
    <form
      onSubmit={handleSubmit}
      className="upload-form w-full mt-4 flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md max-w-md"
    >
      <h3 className="text-lg font-semibold text-gray-800">Reportar Pago</h3>

      {/* Selector de Método de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-amber-200"
        >
          <option value="Transferencia/Pago Móvil">Transferencia / Pago Móvil</option>
          <option value="Efectivo">Efectivo</option>
        </select>
      </div>

      {/* Select Moneda (Solo Efectivo) */}
      {metodoPago === "Efectivo" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select
            value={monedaPago}
            onChange={(e) => setMonedaPago(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-amber-200"
          >
            <option value="Bs">Bolívares (Bs)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
      )}

      {/* Input de archivo (Solo Transferencia) */}
      {metodoPago !== "Efectivo" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-700 
                      file:mr-4 file:py-2 file:px-4 
                      file:rounded file:border-0 
                      file:text-sm file:font-semibold 
                      file:bg-amber-400 file:text-white 
                      hover:file:bg-amber-500 
                      cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, PDF</p>
        </div>
      )}

      {/* Botón de acción */}
      <button
        type="submit"
        disabled={uploading}
        className={`w-full px-4 py-2 rounded text-white font-medium transition mt-2
          ${uploading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-green-500 hover:bg-green-600"}`}
      >
        {uploading ? "Procesando..." : (metodoPago === 'Efectivo' ? "Reportar Pago" : "Subir Comprobante")}
      </button>
    </form>
  );
};

export default UploadReceiptForm;
