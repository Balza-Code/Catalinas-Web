import { useContext, useState } from "react";
import Modal from "./Modal";
import { AuthContext } from "../context/AuthContext";
import UploadReceiptForm from "./UploadReceiptForm";
import Dots from "../Icons/dots.svg"
import { useModal } from "../context/ModalContext";
// Importa tus iconos (Eye, Dots) y tu componente Modal/UploadForm aquí

export const MobileOrderCard = ({
  order,
  onUpdateOrder,
  onReceiptUploaded,
  onDeleteOrder,
}) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const [nota, setNota] = useState(order.notas || "");
  const [comprobanteUrl, setComprobanteUrl] = useState(order.comprobanteUrl);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showModal } = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reutilizamos tu lógica de colores para el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Entregado":
        return "bg-blue-100 text-blue-700";
      case "Pago Completado":
        return "bg-green-100 text-green-700";
      case "Cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const handleSavedNote = () => {
    if (typeof onUpdateOrder === "function") {
      onUpdateOrder(order._id, { notas: nota });
      showModal({ title: 'Nota', message: 'Nota Guardada' });
    } else {
      // safety: should not happen because edit UI is admin-only
      showModal({ title: 'No autorizado', message: 'No autorizado para guardar la nota' });
    }
  };

   const handleUpdateStatus = (newStatus) => {
    onUpdateOrder(order._id, { estado: newStatus });
  };

  const handleCancelOrder = () => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }
    if (typeof onUpdateOrder === "function") {
      onUpdateOrder(order._id, { estado: "Cancelado" });
    }
  };

  const handleReceiptUploaded = (updateOrder) => {
    setComprobanteUrl(updateOrder.comprobanteUrl);
    // Propaga el cambio hacia el padre si fue provisto (para actualizar la lista global)
    if (typeof onReceiptUploaded === "function") {
      onReceiptUploaded(updateOrder);
    }
  };

  const isActionable = ["Pendiente", "Por Verificar", "En preparación"].includes(order.estado);
  const isCompleted = order.estado === "Pago Completado" || order.estado === "Entregado";
  const isCancelled = order.estado === "Cancelado";

  return (
    <>
      <div className="bg-surface-card p-6 rounded-card shadow-sm border border-surface-border hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Pedido</p>
              <p className="mt-1 text-2xl font-black text-slate-800 tracking-tight">{order.items.length} producto{order.items.length === 1 ? '' : 's'}</p>
            </div>
            <span className={`rounded-button border px-3 py-1 text-xs font-bold ${getStatusColor(order.estado)}`}>
              {order.estado === "Pago Completado" ? "Pagado" : order.estado}
            </span>
          </div>
        </div>

        {/* --- PRODUCTOS --- */}
        <div className="mb-5 bg-surface-bg p-4 rounded-button border border-surface-border">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Detalle de Productos</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-slate-700 text-sm font-semibold mb-1 border-b border-surface-border/50 last:border-0 pb-1 last:pb-0">
              <span>{item.cantidad}x {item.nombre}</span>
            </div>
          ))}
        </div>

        {/* --- METADATA DE PAGO --- */}
        {order.metodoPago && order.metodoPago !== 'N/A' && order.metodoPago !== 'Pedido Online' && (
          <div className="mb-5 flex items-center gap-2">
            <span className="px-2 py-1 text-[10px] font-bold rounded-button bg-surface-bg border border-surface-border text-slate-600 uppercase tracking-wider">
               {order.metodoPago === 'Efectivo' ? `💵 Efectivo (${order.monedaPago})` : `🏦 ${order.metodoPago}`}
            </span>
          </div>
        )}

        {/* --- TOTAL Y FECHA (Grid de 2 columnas) --- */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-surface-bg p-3 rounded-button border border-surface-border text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
            <p className="text-xl font-black text-slate-800">${Number(order.total || 0).toFixed(2)}</p>
          </div>
          <div className="bg-surface-bg p-3 rounded-button border border-surface-border text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fecha</p>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {new Date(order.createdAt).toLocaleDateString("es-VE", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* --- FOOTER: CTA PRINCIPAL --- */}
        <div className="border-t border-surface-border pt-5">
          <p className="text-xs font-semibold text-slate-500 mb-4 text-center">
            Tu pedido será enviado directamente al teléfono de Ildefonso.
          </p>
          {isActionable ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-button bg-brand-500 px-5 py-4 text-lg font-black text-white shadow-md transition hover:bg-brand-600"
            >
              💳 Realizar Pago
            </button>
          ) : isCompleted ? (
            order.comprobanteUrl ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-button border border-surface-border bg-surface-bg px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-surface-border hover:text-slate-900"
              >
                Ver Recibo
              </button>
            ) : null
          ) : isCancelled ? (
            <div className="rounded-button border border-status-danger/20 bg-status-danger/10 px-5 py-3 text-center text-sm font-bold text-status-danger">
              Pedido Cancelado
            </div>
          ) : null}
        </div>
      </div>
      {/* --- MODAL (Reutilizamos tu lógica existente) --- */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} title="Gestión del Pedido">
          <div className="space-y-4">
            {/* --- SUBIDA DE COMPROBANTE --- */}
            {order.estado !== "Pago Completado" && order.estado !== "Cancelado" && !comprobanteUrl && (
              <UploadReceiptForm
                orderId={order._id}
                onReceiptUploaded={handleReceiptUploaded}
              />
            )}

            {/* --- VER COMPROBANTE --- */}
            {order.comprobanteUrl ? (
              <a
                href={order.comprobanteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 md:py-4 bg-brand-50 text-brand-700 font-bold rounded-button block text-center hover:bg-brand-100 transition-colors border border-brand-200"
              >
                Abrir Comprobante
              </a>
            ) : order.metodoPago === 'Efectivo' ? (
              <div className="p-4 bg-emerald-50 rounded-button text-center border border-emerald-100">
                  <p className="text-emerald-700 font-bold text-sm">
                    ✅ Pago reportado en Efectivo ({order.monedaPago || 'N/A'})
                  </p>
              </div>
            ) : (
              <div className="p-4 bg-surface-bg rounded-button text-center border border-surface-border">
                <p className="text-slate-500 font-medium text-sm">
                  No hay comprobante disponible.
                </p>
              </div>
            )}

            {/* --- ACCIONES DE ESTADO (SOLO ADMIN) --- */}
            {isAdmin &&
              order.estado !== "Pago Completado" &&
              order.estado !== "Cancelado" && (
                <div className="space-y-4 pt-4 border-t border-surface-border">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Cambiar Estado
                    </p>
                    <select
                      value={order.estado}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="w-full rounded-button border border-surface-border bg-surface-bg px-4 py-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En preparación">En preparación</option>
                      <option value="Por Verificar">Por Verificar</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Pago Completado">Pago Completado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      className="w-full py-3 md:py-4 bg-status-danger/10 text-status-danger font-bold rounded-button hover:bg-status-danger/20 transition-colors border border-status-danger/20"
                    >
                      Cancelar Pedido
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof onDeleteOrder === 'function') {
                          if (window.confirm("¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.")) {
                            onDeleteOrder(order._id);
                            setIsModalOpen(false);
                          }
                        }
                      }}
                      className="w-full py-3 md:py-4 bg-status-danger text-white font-bold rounded-button hover:bg-red-700 transition shadow-md"
                    >
                      Eliminar Pedido Definitivamente
                    </button>
                  </div>
                </div>
              )}

            {!isAdmin && order.estado === "Pendiente" && (
              <div className="space-y-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="w-full py-3 md:py-4 bg-status-danger/10 text-status-danger font-bold rounded-button hover:bg-status-danger/20 transition-colors border border-status-danger/20"
                >
                  Cancelar Pedido
                </button>
              </div>
            )}

            {/* --- NOTAS DEL PEDIDO --- */}
            <div className="pt-4 border-t border-surface-border">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Notas Internas
              </h5>
              {isAdmin ? (
                <>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Escribe detalles o notas del pedido..."
                    rows="3"
                    className="w-full p-4 text-sm font-medium bg-surface-bg border border-surface-border rounded-button resize-none text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSavedNote}
                    className="mt-3 w-full py-3 md:py-4 bg-brand-500 text-white font-bold rounded-button hover:bg-brand-600 shadow-md transition-colors"
                  >
                    Guardar Nota
                  </button>
                </>
              ) : (
                <div className="p-4 bg-surface-bg border border-surface-border rounded-button text-slate-700 text-sm font-medium">
                  {nota && nota.trim().length > 0 ? (
                    <p>{nota}</p>
                  ) : (
                    <p className="text-slate-400 italic">
                      Sin observaciones.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
