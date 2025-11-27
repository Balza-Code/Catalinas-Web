// src/pages/CustomerDashboard.jsx
import { OrderList } from '../components/OrderList';
import OrderSection from '../components/OrderSection';
import { useCatalinas } from '../hooks/useCatalinas';
import useOrders from '../hooks/useOrders';
import { createOrder } from '../services/orderService';

function CustomerDashboard() {
  const { catalinas } = useCatalinas();
  // 1. Asegúrate de estar obteniendo 'setOrders' del hook
  const { orders, setOrders } = useOrders();

  const catalinasOnline = catalinas.filter(c => 
    c.disponible && (c.tipoVenta === 'online' || c.tipoVenta === 'ambos')
  );

  // 2. ASEGÚRATE DE QUE ESTA FUNCIÓN EXISTE.
  // Esta es la función que recibe el aviso del componente OrderSection
  const handleOrderPlaced = async (orderData) => {
  const newOrder = await createOrder(orderData); // ✅ backend lo devuelve con createdAt
  setOrders([newOrder, ...orders]); // ✅ ahora sí tiene fecha válida
  return newOrder; // ✅ esto permite que OrderSection lo reciba completo
};


  

  return (
    <div className="md:mt-0 z-20 max-h-full ">
      <section className="max-w-6xl mx-auto">
        <OrderSection
          catalinas={catalinasOnline}
          onOrderPlace={handleOrderPlaced}
        />
      </section>
    </div>
  );
}

export default CustomerDashboard;