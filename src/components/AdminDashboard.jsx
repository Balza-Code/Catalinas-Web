import React from 'react';
import { useCatalinas } from "../hooks/useCatalinas";
import useOrders from "../hooks/useOrders";
import { deleteCatalina, updateCatalina } from "../services/catalinaService";
import { createOrder, updateOrder } from "../services/orderService";

// Importa las funciones de los servicios que necesitarás para modificar datos

import AddCatalinaForm from "./AddCatalinaForm";
import CatalinasList from "./CatalinasList";
import Dashboard from "./Dashboard";
import { OrderList } from "./OrderList";
import OrderSection from "./OrderSection";
import VentaDetalForm from "./VentaDetalForm";
// (Aqui tambien importarías los servicios para catalinas si vas a editarlas desde aqui)

// Importa los componentes visuales

function AdminDashboard() {
  // 1. Obtiene los datos y funciones para manejar el estado de los hooks
  const { catalinas, setCatalinas } = useCatalinas();
  const { orders, setOrders } = useOrders();

  // Local state para edición de catalinas (propagamos a CatalinasList)
  const [editingId, setEditingId] = React.useState(null);
  const [editFormData, setEditFormData] = React.useState({
    nombre: "",
    precio: "",
    descripcion: "",
  });

  // 2. Define las funciones "Manejadoras" que los componentes hijos llamarán
  const handleOrderPlaced = (newOrder) => {
    // Actualiza el estado local para que la UI reaccione instantáneamente
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      // Llama a la función del servicio para actualizar el backend
      const updated = await updateOrder(id, { estado: newStatus });
      // Actualiza el estado en el frontend
      setOrders(orders.map((order) => (order._id === id ? updated : order)));
    } catch (error) {
      console.error("Error al actualizar el estado: ", error);
      // Aqui podrías mostrar una notificación del error al usuario
    }
  };

  const handleCatalinaAdded = (nuevaCatalina) => {
    // Añadimos la nueva catalina a la lista existente en el estado
    // para que la pantalla se actualice sin tener que recargar
    setCatalinas([...catalinas, nuevaCatalina]);
  };

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

  return (
    <>
      <Dashboard orders={orders} />
      <hr />
      <div className="main-layout">
        <div className="sales-form">
          <div className="detal-section">
            <h2>Venta Rápida (al detal)</h2>
            <VentaDetalForm
              catalinas={catalinas}
              onOrderPlaced={handleOrderPlaced}
            />
          </div>
          <hr />

        <OrderSection catalinas={catalinas} onOrderPlace={async (orderData) => {
          const newOrder = await createOrder(orderData);
          // actualizar listado local
          setOrders((prev) => [newOrder, ...prev]);
          return newOrder;
        }} />
         
        </div>

        <div className="admin-section">
          <AddCatalinaForm onCatalinaAdded={handleCatalinaAdded} />
          <CatalinasList
            catalinas={catalinas}
            editingId={editingId}
            editFormData={editFormData}
            onEditClick={handleEditClick}
            onEditFormChange={handleEditFormChange}
            onUpdateSubmit={handleUpdateCatalina}
            onCancelEdit={() => setEditingId(null)}
            onDelete={handleDeleteCatalina}
          />
          <h2>Historial de Pedidos y Ventas</h2>
          <OrderList orders={orders} onUpdateStatus={handleUpdateOrderStatus} />

        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
