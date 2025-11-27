import React from 'react'
import AddCatalinaForm from '../components/AddCatalinaForm'
import CatalinasList from '../components/CatalinasList'
import { useCatalinas } from '../hooks/useCatalinas'
import { deleteCatalina, updateCatalina } from '../services/catalinaService'

export const AgregarProductosPage = () => {
  const { catalinas, setCatalinas} = useCatalinas();

  // Local state para edición de catalinas (propagamos a CatalinasList)
    const [editingId, setEditingId] = React.useState(null);
    const [editFormData, setEditFormData] = React.useState({
      nombre: "",
      precio: "",
      descripcion: "",
    });

    const handleEditClick = (catalina) => {
    setEditingId(catalina._id);
    setEditFormData({
      nombre: catalina.nombre,
      precio: catalina.precio,
      descripcion: catalina.descripcion,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateCatalina = async (e, id) => {
    e.preventDefault();
    try {
      const updated = await updateCatalina(id, editFormData);
      setCatalinas(catalinas.map((c) => (c._id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCatalina = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta catalina?")) return;
    try {
      await deleteCatalina(id);
      setCatalinas(catalinas.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Renderiza el layout pasando los datos y funciones como props.

  const handleCatalinaUpdated = (updatedCatalina) => {
    // Actualiza la lista maestra de 'catalinas'
    setCatalinas(
      catalinas.map((c) =>
        c._id === updatedCatalina._id ? updatedCatalina : c
      )
    );
  };

  const handleCatalinaAdded = (nuevaCatalina) => {
    // Añadimos la nueva catalina a la lista existente en el estado
    // para que la pantalla se actualice sin tener que recargar
    setCatalinas([...catalinas, nuevaCatalina]);
  };

  


  return (
    <div className='border p-4 border-gray-200 flex flex-wrap  rounded-lg shadow gap-2 mb-24 bg-white overflow-y-auto md:max-h-[560px]'>
      <h3 className="h6 text-gray-600">Productos Disponibles</h3>
     <CatalinasList
            catalinas={catalinas}
            editingId={editingId}
            editFormData={editFormData}
            onEditClick={handleEditClick}
            onEditFormChange={handleEditFormChange}
            onUpdateSubmit={handleUpdateCatalina}
            onCancelEdit={() => setEditingId(null)}
            onDelete={handleDeleteCatalina}
            onCatalinaUpdated={handleCatalinaUpdated}
          />
    <AddCatalinaForm onCatalinaAdded={handleCatalinaAdded} />
    </div>
  )
}
