// Props-driven presentational component for rendering the list of catalinas.

import CatalinaCard from "./CatalinaCard";

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
  onCatalinaUpdated,
}) {
  return (
    <div className="catalinas-list grid grid-cols-2 md:grid-cols-4 grid-flow-rows w-full gap-2">
      {/* Mapeamos el array de catalinas para mostrarlas */}
      {catalinas.map((catalina, index) => (
        <CatalinaCard
          key={index}
          catalina={catalina}
          editingId={editingId}
          editFormData={editFormData}
          onEditClick={onEditClick}
          onEditFormChange={onEditFormChange}
          onUpdateSubmit={onUpdateSubmit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onCatalinaUpdated={onCatalinaUpdated}
        />
      ))}
    </div>
  );
}
