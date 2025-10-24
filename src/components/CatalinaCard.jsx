// src/components/CatalinaCard.jsx
import UploadProductImage from './UploadProductImage'; // <-- IMPORTA EL NUEVO FORM
// Recibe la nueva prop onCatalinaUpdated
function CatalinaCard({
  catalina,
  onEditClick,
  onDelete,
  editingId,
  editFormData,
  onEditFormChange,
  onUpdateSubmit,
  onCancelEdit,
  onCatalinaUpdated
}) {
  const handleImageUploaded = (updatedCatalina) => {
    // Llama a la función del 'Gerente' (AdminDashboard) para refrescar la lista
    onCatalinaUpdated(updatedCatalina);
  };

  return (
    <div key={catalina._id} className="catalina-card">
      {/* --- MUESTRA LA IMAGEN --- */}
      {catalina.imageUrl ? (
        <img src={catalina.imageUrl} alt={catalina.nombre} className="product-image" />
      ) : (
        <div className="no-image-placeholder">Sin Imagen</div>
      )}

      {editingId === catalina._id ? (
        // Vista de edición (formulario)
        <form onSubmit={(e) => onUpdateSubmit(e, catalina._id)}>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={editFormData.nombre || ""}
            onChange={onEditFormChange}
          />
          <input
            type="number"
            name="precio"
            id="precio"
            value={editFormData.precio || ""}
            onChange={onEditFormChange}
          />
          <textarea
            name="descripcion"
            value={editFormData.descripcion || ""}
            onChange={onEditFormChange}
          />
          <button type="submit">Guardar</button>
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        </form>
      ) : (
        // Vista normal (información)
        <>
          <h2>{catalina.nombre}</h2>
          <p>Precio: ${catalina.precio}</p>
          <p>{catalina.descripcion}</p>
          {/* <button onClick={() => onEditClick(catalina)}>Editar</button>
          <button className="delete-btn" onClick={() => onDelete(catalina._id)}>
            Eliminar
          </button> */}
        </>
      )}

      {/* --- MUESTRA EL FORMULARIO DE SUBIDA --- */}
      <UploadProductImage catalinaId={catalina._id} onImageUploaded={handleImageUploaded} />

      <div className="card-actions">
        <button onClick={() => onEditClick(catalina)}>Editar</button>
        <button className="delete-btn" onClick={() => onDelete(catalina._id)}>Eliminar</button>
      </div>
   
    </div>
  );
}
export default CatalinaCard;
