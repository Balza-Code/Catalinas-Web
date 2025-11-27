// src/pages/CustomerDashboard.jsx
import { OrderList } from '../components/OrderList';
import OrderSection from '../components/OrderSection';
import { useCatalinas } from '../hooks/useCatalinas';
import useOrders from '../hooks/useOrders';
import { createOrder } from '../services/orderService';

function CustomerDashboard() {
  
  // 1. Asegúrate de estar obteniendo 'setOrders' del hook
  const { orders, setOrders } = useOrders();

  

  // --- NUEVA FUNCIÓN (idéntica a la del Admin) ---
  const handleReceiptUploaded = (updatedOrder) => {
    setOrders(orders.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ));
  };

  return (
    <div className="md:mt-0 z-20 max-h-full bg-[#f5f0e6] p-4 max-h-[540px]">
      <section className="max-w-6xl mx-auto">
        <h2 className="h6 mb-4">Mis Pedidos</h2>
        
        <OrderList
          orders={orders}
          onReceiptUploaded={handleReceiptUploaded}
        />
      </section>
    </div>
  );
}

export default CustomerDashboard;