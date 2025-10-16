import { OrderCard } from "./OrderCard";

export const OrderList = ({ orders = [], onUpdateStatus }) => {
  return (
    <div className="ordes-list">
      {orders.map((order) => (
        <OrderCard
          key={order._id || order.id}
          order={order}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};
