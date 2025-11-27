import { MobileOrderCard } from "./MobileOrderCard";
import { OrderCard } from "./OrderCard";


export const OrderList = ({ orders = [], onUpdateOrder, onReceiptUploaded }) => {
  return (

    <div className="w-full">

    <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <MobileOrderCard 
            key={order._id} 
            order={order}
            onUpdateOrder={onUpdateOrder}
            onReceiptUploaded={onReceiptUploaded}
          />
        ))}
      </div>

    <div className="hidden md:block rounded-lg overflow-y-scroll w-full  max-h-[550px]">

   <table className="min-w-full table-auto text-sm ">
  <thead className=" bg-gray-100 text-left rounded-2xl ">
    <tr>
      <th className="px-8 py-4 text-gray-500">Cliente</th>
      <th className="px-8 py-4 text-gray-500">Cantidad de Productos</th>
      <th className="px-8 py-4 text-gray-500">Total</th>
      <th className="px-8 py-4 text-gray-500">Fecha</th>
      <th className="px-8 py-4 text-gray-500">Estado</th>
      <th className="px-8 py-4 text-gray-500">Detalles</th>
    </tr>
  </thead>
  <tbody>
    {orders.map((order) => (
      <OrderCard
        key={order._id || order.id}
        order={order}
        onUpdateOrder={onUpdateOrder}
        onReceiptUploaded={onReceiptUploaded}
        />
    ))}
  </tbody>
</table>
    </div>
        </div>
  );
};

