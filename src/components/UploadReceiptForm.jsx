import { useState } from "react";
import { uploadReceipt } from "../services/orderService";
import { useModal } from "../context/ModalContext";

const UploadReceiptForm = ({ orderId, onReceiptUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showModal } = useModal();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      showModal({ title: 'Archivo faltante', message: 'Por favor, selecciona un archivo.' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("comprobante", file);

    try {
      const updatedOrder = await uploadReceipt(orderId, formData);
      showModal({ title: 'Comprobante', message: '¡Comprobante subido!' });
      onReceiptUploaded(updatedOrder);
      
    } catch (error) {
      console.error("Error de red:", error);
      showModal({ title: 'Error', message: 'Error al subir el archivo.' });
    } finally {
      setUploading(false);
    }
  };

  return ( 
    <form
  onSubmit={handleSubmit}
  className="upload-form w-full mt-4 flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md max-w-md"
>
  <h3 className="text-lg font-semibold text-gray-800">Subir Comprobante</h3>

  {/* Input de archivo */}
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
  <p className="text-xs text-gray-500">Formatos permitidos: JPG, PNG, PDF</p>

  {/* Botón de acción */}
  <button
    type="submit"
    disabled={uploading}
    className={`w-full px-4 py-2 rounded text-white font-medium transition 
      ${uploading 
        ? "bg-gray-400 cursor-not-allowed" 
        : "bg-green-500 hover:bg-green-600"}`}
  >
    {uploading ? "Subiendo..." : "Subir Comprobante"}
  </button>
</form>

  );
};

export default UploadReceiptForm;
