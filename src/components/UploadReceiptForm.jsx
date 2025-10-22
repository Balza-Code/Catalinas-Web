import { useState } from "react";
import { uploadReceipt } from "../services/orderService";

const UploadReceiptForm = ({ orderId, onReceiptUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Por favor, selecciona un archivo. ");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("comprobante", file);

    try {
      const updatedOrder = await uploadReceipt(orderId, formData);
      alert('¡Comprobante subido!');
      onReceiptUploaded(updatedOrder);
      
    } catch (error) {
      console.error("Error de red:", error);
      alert('Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  return ( 
    <form onSubmit={handleSubmit} className="upload-form">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Subiendo...' : 'Subir Comprobante'}
      </button>
    </form>
  );
};

export default UploadReceiptForm;
