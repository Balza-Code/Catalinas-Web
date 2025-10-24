import { useState } from "react";
import { uploadCatalinaImage } from "../services/catalinaService";

const UploadReceiptForm = ({ catalinaId, onImageUploaded }) => {
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
    formData.append("imagenProducto", file);

    try {
      const updatedCatalina = await uploadCatalinaImage(catalinaId, formData);
      alert('Producto subido!');
      onImageUploaded(updatedCatalina);
      
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
        {uploading ? 'Subiendo...' : 'Subir Imagen'}
      </button>
    </form>
  );
};

export default UploadReceiptForm;
