// src/pages/CustomerDashboard.jsx
import { OrderList } from '../components/OrderList';
import OrderSection from '../components/OrderSection';
import { useCatalinas } from '../hooks/useCatalinas';
import useOrders from '../hooks/useOrders';

function CustomerDashboard() {
  const { catalinas } = useCatalinas();
  // 1. Asegúrate de estar obteniendo 'setOrders' del hook
  const { orders, setOrders } = useOrders();

  // 2. ASEGÚRATE DE QUE ESTA FUNCIÓN EXISTE.
  // Esta es la función que recibe el aviso del componente OrderSection
  const handleOrderPlaced = (newOrder) => {
    // 3. Y LO MÁS IMPORTANTE: que esté llamando a 'setOrders'
    // para actualizar el estado y provocar un nuevo render.
    setOrders([newOrder, ...orders]);
  };

  // --- NUEVA FUNCIÓN (idéntica a la del Admin) ---
  const handleReceiptUploaded = (updatedOrder) => {
    setOrders(orders.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ));
  };

  return (
    <div className="customer-dashboard">
      <OrderSection
        catalinas={catalinas}
        // 4. Asegúrate de estar pasando la función como prop
        onOrderPlaced={handleOrderPlaced}
      />
      <hr />
      <div className="admin-section">
        <h2>Mis Pedidos</h2>
        {console.log('Renderizando lista de pedidos:', orders)} {/* Tu console.log */}
        <OrderList
          orders={orders}
           // Correcto, los clientes no actualizan
          onReceiptUploaded={handleReceiptUploaded}
        />
      </div>
    </div>
  );
}

export default CustomerDashboard;