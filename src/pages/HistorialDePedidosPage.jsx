import React from 'react'
import { OrderList } from '../components/OrderList'
import useOrders from '../hooks/useOrders';
import { updateOrder } from '../services/orderService';

export const HistorialDePedidosPage = () => {
  const { orders, setOrders } = useOrders();

  const handleReceiptUploaded = (updatedOrder) => {
    setOrders(orders.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ));
  };

  // 2. Define las funciones "Manejadoras" que los componentes hijos llamarán
  
  const handleUpdateOrder = async (id, updateData) => {
    try {
      // Llama a la función del servicio para actualizar el backend
      // updateData may already be an object like { estado: 'Entregado' }
      // so pass it through as-is to avoid double-wrapping
      const payload = typeof updateData === 'string' ? { estado: updateData } : updateData;
      const updatedOrder = await updateOrder(id, payload);
      // Actualiza el estado en el frontend
      setOrders(orders.map((order) => (order._id === id ? updatedOrder : order)));
    } catch (error) {
      console.error("Error al actualizar el estado: ", error);
      // Aqui podrías mostrar una notificación del error al usuario
    }
  };


  return (
    <div className='features-layout p-2'>
    <OrderList orders={orders}
           onUpdateOrder={handleUpdateOrder}
           onReceiptUploaded={handleReceiptUploaded}
           />
    </div>
  )
}
