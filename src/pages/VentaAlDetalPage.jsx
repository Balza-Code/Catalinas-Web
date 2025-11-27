import React from "react";
import CatalinasList from "../components/CatalinasList";
import { useCatalinas } from "../hooks/useCatalinas";
import VentaDetalForm from "../components/VentaDetalForm";
import { deleteCatalina, updateCatalina } from "../services/catalinaService";

export const VentaAlDetalPage = () => {
  const { catalinas, setCatalinas } = useCatalinas();

  // Local state para edición de catalinas (propagamos a CatalinasList)

  // 3. Renderiza el layout pasando los datos y funciones como props.
  const catalinasDetal = catalinas.filter(
    (c) => c.disponible && (c.tipoVenta === "detal" || c.tipoVenta === "ambos")
  );

  return (
    <>
      <div className="">
        {/* <CatalinasList catalinas={catalinas} editingId={editingId} editFormData={editFormData} onEditClick={handleEditClick} onEditFormChange={handleEditFormChange} onUpdateSubmit={handleUpdateCatalina} onCancelEdit={() => setEditingId(null)} onDelete={handleDeleteCatalina} onCatalinaUpdated={handleCatalinaUpdated}  /> */}

        <VentaDetalForm catalinas={catalinasDetal} />
      </div>
    </>
  );
};
