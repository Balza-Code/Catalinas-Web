import { useState } from "react";

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
      const response = await fetch(
        `http://localhost:4000/api/orders/${orderId}/upload-receipt`,
        {
          method: "POST",
          body: formData, // No se necesita 'Content-Type', el navegador lo pone solo
        }
      );

      const updateOrder = await response.json();
      if (response.ok) {
        alert("¡Comprobante Subido!");
        onReceiptUploaded(updateOrder);
      } else {
        alert("Error al subir el archivo.");
      }
    } catch (error) {
      console.error("Error de red: ", error);
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
