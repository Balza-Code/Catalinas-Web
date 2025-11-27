// src/components/CatalinaCard.jsx
import UploadProductImage from "./UploadProductImage"; // <-- IMPORTA EL NUEVO FORM
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
  onCatalinaUpdated,
}) {
  const handleImageUploaded = (updatedCatalina) => {
    // Llama a la función del 'Gerente' (AdminDashboard) para refrescar la lista
    onCatalinaUpdated(updatedCatalina);
  };

  return (
    <div
      key={catalina._id}
      className=" flex p-4  border border-gray-100 shadow shadow-gray-100 rounded-lg "
    >
      <div className='rounded-lg flex flex-col items-start max-w-3xs  gap-1'>
        {/* --- MUESTRA LA IMAGEN --- */}
        {catalina.imageUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-(--primary-100) rounded">
            <img
              src={catalina.imageUrl}
              alt={catalina.nombre}
              className="min-w-[150x]"
            />
          </div>
        ) : (
          <div className="no-image-placeholder">Sin Imagen</div>
        )}

        {editingId === catalina._id ? (
          // Vista de edición (formulario)
          <form
            onSubmit={(e) => onUpdateSubmit(e, catalina._id)}
            className="w-full mt-4 space-y-3 text-sm"
          >
            {/* Nombre */}
            <input
              type="text"
              name="nombre"
              id="nombre"
              value={editFormData.nombre || ""}
              onChange={onEditFormChange}
              placeholder="Nombre del producto"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {/* Precio */}
            <input
              type="number"
              name="precio"
              id="precio"
              value={editFormData.precio || ""}
              onChange={onEditFormChange}
              placeholder="Precio en USD"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {/* Descripción */}
            <textarea
              name="descripcion"
              value={editFormData.descripcion || ""}
              onChange={onEditFormChange}
              placeholder="Descripción del producto"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {/* Subida de imagen */}
            <div className="pt-2">
              <UploadProductImage
                catalinaId={catalina._id}
                onImageUploaded={handleImageUploaded}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          // Vista normal (información)
          <div className="mt-2 gap-1">
            <h2 className='b1 text-gray-600'>{catalina.nombre}</h2>
            <p className="b3 text-gray-400">{catalina.descripcion}</p>
            <p className="b1 font-bold text-gray-600">{catalina.precio} USD</p>
            {/* <button onClick={() => onEditClick(catalina)}>Editar</button>
          <button className="delete-btn" onClick={() => onDelete(catalina._id)}>
          Eliminar
          </button> */}
          </div>
        )}

        {/* --- MUESTRA EL FORMULARIO DE SUBIDA --- */}

        {editingId === catalina._id ? (
          <div></div>
        ) : (
          <div className="flex gap-1 mt-1">
            <button
              className=" px-4 py-2 bg-amber-300 hover:bg-amber-500 text-gray-50 rounded-lg b2"
              onClick={() => onEditClick(catalina)}
            >
              Editar
            </button>
            <button
              className=" px-4 py-2 bg-red-400 hover:bg-red-500 text-gray-50 rounded-lg b2"
              onClick={() => onDelete(catalina._id)}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default CatalinaCard;
