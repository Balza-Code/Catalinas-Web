import { useCatalinas } from '../hooks/useCatalinas';
import useOrders from '../hooks/useOrders';
import { createOrder } from '../services/orderService';
import CustomerStorefront from '../components/CustomerStorefront';

function CustomerDashboard() {
  const { catalinas } = useCatalinas();
  const { orders, setOrders } = useOrders();

  const catalinasOnline = catalinas.filter(c => 
    c.disponible && (c.tipoVenta === 'online' || c.tipoVenta === 'ambos')
  );

  const handleOrderPlaced = async (orderData) => {
    const newOrder = await createOrder(orderData); 
    setOrders([newOrder, ...orders]); 
    return newOrder; 
  };

  return (
    <div className="md:mt-0 z-20 max-h-full h-[calc(100vh-8rem)]">
      <CustomerStorefront
        catalinas={catalinasOnline}
        onOrderPlace={handleOrderPlaced}
      />
    </div>
  );
}

export default CustomerDashboard;