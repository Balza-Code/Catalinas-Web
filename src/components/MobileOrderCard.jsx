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
}) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const [nota, setNota] = useState(order.notas || "");
  const [comprobanteUrl, setComprobanteUrl] = useState(order.comprobanteUrl);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showModal } = useModal();

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

  const handleReceiptUploaded = (updateOrder) => {
    setComprobanteUrl(updateOrder.comprobanteUrl);
    // Propaga el cambio hacia el padre si fue provisto (para actualizar la lista global)
    if (typeof onReceiptUploaded === "function") {
      onReceiptUploaded(updateOrder);
    }
  };

  return (
    <>
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
        {/* --- CABECERA: Cliente y Estado --- */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Cliente</p>
            <p className="font-bold text-gray-800 text-lg">
              {order.clienteNombre}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
              order.estado
            )}`}
          >
            {order.estado === "Pago Completado" ? "Completed" : order.estado}
          </span>
        </div>

        {/* --- PRODUCTOS --- */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-medium mb-1">Productos</p>
          {order.items.map((item, i) => (
            <p key={i} className="text-gray-600 text-sm font-medium">
              {item.cantidad}x {item.nombre}
            </p>
          ))}
        </div>

        {/* --- TOTAL Y FECHA (Grid de 2 columnas) --- */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Total</p>
            <p className="font-bold text-gray-900">{order.total} USD</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Fecha</p>
            <p className="font-bold text-gray-600">
              {new Date(order.createdAt).toLocaleDateString("es-VE", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* --- FOOTER: Divisor y Acciones --- */}
        <div className="border-t border-gray-100 pt-3 flex justify-end items-center gap-4">
          {/* Botón Detalles (Ojo) */}
          <button
            onClick={() => setShowModal(true)}
            className="text-gray-400 hover:text-amber-600 transition-colors"
          ></button>

          {/* Botón Menú (3 puntos) */}
          <button
            onClick={() => setShowModal(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <img src={Dots} alt="" className="cursor-pointer" />
          </button>
        </div>
      </div>

      {/* --- MODAL (Reutilizamos tu lógica existente) --- */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Gestión del Pedido">
          <div className="space-y-4">
            {/* --- SUBIDA DE COMPROBANTE --- */}
            {order.estado === "Entregado" && !comprobanteUrl && (
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
                // CAMBIO: py-3 en móvil, py-4 en desktop. text-sm en móvil.
                className="w-full py-3 md:py-4 bg-blue-50 text-blue-600 font-semibold rounded-xl block text-center hover:bg-blue-100 transition border border-blue-200"
              >
                Ver comprobante
              </a>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500 text-sm">
                  No hay comprobante disponible.
                </p>
              </div>
            )}

            {/* --- ACCIONES DE ESTADO (SOLO ADMIN) --- */}
            {isAdmin &&
              order.estado !== "Pago Completado" &&
              order.estado !== "Cancelado" && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Cambiar Estado
                  </p>

                  {order.estado !== "Entregado" && (
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus("En preparación")}
                        // CAMBIO: Padding reducido y esquinas más suaves
                        className="w-full py-3 md:py-4 bg-yellow-100 text-yellow-800 font-medium rounded-xl hover:bg-yellow-200 transition"
                      >
                        Marcar: En preparación
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus("Entregado")}
                        className="w-full py-3 md:py-4 bg-blue-100 text-blue-800 font-medium rounded-xl hover:bg-blue-200 transition"
                      >
                        Marcar: Entregado
                      </button>
                    </div>
                  )}

                  {order.estado === "Entregado" && comprobanteUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("Pago Completado")}
                      className="w-full py-3 md:py-4 bg-green-100 text-green-800 font-medium rounded-xl hover:bg-green-200 transition"
                    >
                      Marcar: Pago Completado
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("Cancelado")}
                    className="w-full py-3 md:py-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition border border-red-100"
                  >
                    Cancelar Pedido
                  </button>
                </div>
              )}

            {/* --- NOTAS DEL PEDIDO --- */}
            <div className="pt-2">
              <h5 className="text-sm font-bold text-gray-700 mb-2">
                Notas del Pedido
              </h5>
              {isAdmin ? (
                <>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Escribe detalles del pago..."
                    rows="3"
                    // CAMBIO: text-base evita que el iPhone haga zoom al escribir
                    className="w-full p-3 text-base border border-gray-300 rounded-xl resize-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSavedNote}
                    className="mt-3 w-full py-3 md:py-4 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition"
                  >
                    Guardar Nota
                  </button>
                </>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm">
                  {nota && nota.trim().length > 0 ? (
                    <p>{nota}</p>
                  ) : (
                    <p className="text-gray-400 italic">
                      Sin notas del administrador.
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
