
// Props-driven presentational component for rendering the list of catalinas.
// The parent component should pass all handlers and state needed for edit/delete.
export default function CatalinasList({
  catalinas = [],
  editingId = null,
  editFormData = {},
  onEditClick = () => {},
  onEditFormChange = () => {},
  onUpdateSubmit = () => {},
  onCancelEdit = () => {},
  onDelete = () => {},
})
 {
  
  return (
    <div className="catalinas-list">
      {/* Mapeamos el array de catalinas para mostrarlas */}
      {catalinas.map((catalina, index) => (
        <div key={catalina._id || index} className="catalina-card">
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
              <button onClick={() => onEditClick(catalina)}>Editar</button>
              <button className="delete-btn" onClick={() => onDelete(catalina._id)}>
                Eliminar
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
