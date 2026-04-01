import React from 'react';
import { useCatalinas } from "../hooks/useCatalinas";
import useOrders from "../hooks/useOrders";
import { deleteCatalina, updateCatalina } from "../services/catalinaService";
import { updateOrder, deleteOrder } from "../services/orderService";

// Importa las funciones de los servicios que necesitarás para modificar datos

import Dashboard from "./Dashboard";
import ClientDirectory from '../pages/ClientDirectory';
import { OrderList } from './OrderList';
// (Aqui tambien importarías los servicios para catalinas si vas a editarlas desde aqui)

// Importa los componentes visuales

function AdminDashboard() {
  // 1. Obtiene los datos y funciones para manejar el estado de los hooks
  const { catalinas, setCatalinas } = useCatalinas();
  const { orders, setOrders } = useOrders()
  

  

  // --- NUEVA FUNCIÓN ---
  // Esta función actualizará la UI cuando se suba un comprobante
  

  
  
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error("Error eliminando pedido:", error);
      alert("Error al eliminar el pedido");
    }
  };

  return (
    <div className='general-layout'>
    {/* <PaymentAlerts orders={orders} /> */}

      <Dashboard orders={orders} />

      {/* <div className="admin-section">
        <h2>Historial de Pedidos y Ventas</h2>
        <OrderList orders={orders}
         onUpdateOrder={handleUpdateOrder}
         onReceiptUploaded={handleReceiptUploaded}
         onDeleteOrder={handleDeleteOrder}
         />
      </div> */}

      

      
      
       {/* <div className="sales-form">
          {/* <div className="detal-section">
            <h2>Venta Rápida (al detal)</h2>
            <VentaDetalForm
              catalinas={catalinas}
              onOrderPlaced={handleOrderPlaced}
            />
          </div> */}
          

        {/* <OrderSection catalinas={catalinas} onOrderPlace={async (orderData) => {
          const newOrder = await createOrder(orderData);
          // actualizar listado local
          setOrders((prev) => [newOrder, ...prev]);
          return newOrder;
        }} /> */}
         
        {/* </div> */}

        {/* <div className="admin-section">
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
            onCatalinaUpdated={handleCatalinaUpdated}
          />
          <h2>Historial de Pedidos y Ventas</h2>
          <OrderList orders={orders}
           onUpdateOrder={handleUpdateOrder}
           onReceiptUploaded={handleReceiptUploaded}
           onDeleteOrder={handleDeleteOrder}
           /> */}

        </div>
      
    
  );
}

export default AdminDashboard;
