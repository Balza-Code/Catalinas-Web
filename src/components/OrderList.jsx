import { MobileOrderCard } from "./MobileOrderCard";

export const OrderList = ({ orders = [], onUpdateOrder, onReceiptUploaded, onDeleteOrder }) => {
  return (
    <div className="w-full">
      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-surface-border bg-surface-card p-10 text-center shadow-sm">
          <p className="text-xl font-black text-slate-800 tracking-tight">Aún no tienes pedidos.</p>
          <p className="mt-2 text-sm font-medium text-slate-500">Cuando realices tu primer pedido, lo verás aquí de inmediato.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <MobileOrderCard
              key={order._id || order.id}
              order={order}
              onUpdateOrder={onUpdateOrder}
              onReceiptUploaded={onReceiptUploaded}
              onDeleteOrder={onDeleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

