import { useState } from "react";
import UploadReceiptForm from "./UploadReceiptForm";

export const OrderCard = ({ order, onUpdateStatus }) => {
  const [comprobanteUrl, setComprobanteUrl] = useState(order.comprobanteUrl);
  const handleReceiptUploaded = (updateOrder) => {
  setComprobanteUrl(updateOrder.comprobanteUrl);  };
  return (
    <>
      <div className="order-card">
        {/* Pequelo cambio para mostrar tipo de venta */}
        <span className="order-type">{order.tipoVenta}</span>
        <h3>Pedido de: {order.clienteNombre} </h3>
        {/* {Hacemos que el estado cambie de color dinámicamente} */}
        <p>
          Estado:{" "}
          <strong className={`status-${order.estado.toLowerCase()}`}>
            {order.estado}
          </strong>{" "}
        </p>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {" "}
              {item.cantidad}x {item.nombre} (${item.precio}){" "}
            </li>
          ))}
        </ul>
        <h4>Total: ${order.total.toFixed(2)} </h4>
        <small>Fecha: {new Date(order.createdAt).toLocaleString()} </small>

        {/* Lógica condicional para mostrar la subida o el enlace */}
        {order.estado === "Entregado" && (
          <div className="receipt-section">
            {comprobanteUrl ? (
              <a
                href={comprobanteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver comprobante
              </a>
            ) : (
              <UploadReceiptForm
                orderId={order._id}
                onReceiptUploaded={handleReceiptUploaded}
              />
            )}
          </div>
        )}

        {/* {Mostramos las acciones solo si el pedido No está entregado/cancelado} */}
        {order.estado !== "Entregado" && order.estado !== "Cancelado" && (
          <div className="order-actions">
            <button
              type="button"
              onClick={() => onUpdateStatus(order._id, "En preparación")}
            >
              En preparación
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(order._id, "Entregado")}
            >
              Entregado
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(order._id, "Cancelado")}
            >
              Cancelado
            </button>
          </div>
        )}
      </div>
    </>
  );
};

