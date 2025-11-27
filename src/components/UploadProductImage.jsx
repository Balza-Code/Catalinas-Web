import { useState } from "react";
import { uploadCatalinaImage } from "../services/catalinaService";
import { useModal } from "../context/ModalContext";

const UploadProductImage = ({ catalinaId, onImageUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { showModal } = useModal();

  const handleUpload = async () => {
    if (!file) {
      showModal({ title: 'Archivo faltante', message: 'Por favor, selecciona un archivo.' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("imagenProducto", file);

    try {
      const updatedCatalina = await uploadCatalinaImage(catalinaId, formData);
      showModal({ title: 'Éxito', message: 'Producto subido!' });
      onImageUploaded(updatedCatalina);
      setFile(null);
    } catch (error) {
      console.error("Error de red:", error);
      showModal({ title: 'Error', message: 'Error al subir el archivo.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form w-full mt-4 flex flex-col gap-3">
  {/* Input de archivo */}
  <input
    type="file"
    onChange={(e) => setFile(e.target.files && e.target.files[0])}
    className="block w-full text-sm text-gray-700 
               file:mr-4 file:py-2 file:px-4 
               file:rounded file:border-0 
               file:text-sm file:font-semibold 
               file:bg-amber-400 file:text-white 
               hover:file:bg-amber-500 
               cursor-pointer"
  />

  {/* Botón de acción */}
  <button
    type="button"
    onClick={handleUpload}
    disabled={uploading}
    className={`px-4 py-2 rounded text-white font-medium transition 
      ${uploading 
        ? "bg-gray-400 cursor-not-allowed" 
        : "bg-green-500 hover:bg-green-600"}`}
  >
    {uploading ? "Subiendo..." : "Subir Imagen"}
  </button>
</div>

  );
};

export default UploadProductImage;
