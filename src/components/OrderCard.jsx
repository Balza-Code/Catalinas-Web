import { useEffect, useState, useContext } from "react";
import UploadReceiptForm from "./UploadReceiptForm";
import Modal from "./Modal";
import { AuthContext } from "../context/AuthContext";
import Dots from "../Icons/dots.svg";
import { useModal } from "../context/ModalContext";

export const OrderCard = ({
  order,
  onUpdateOrder,
  onReceiptUploaded,
  onDeleteOrder,
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [comprobanteUrl, setComprobanteUrl] = useState(order.comprobanteUrl);
  const [nota, setNota] = useState(order.notas || "");
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const { showModal } = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReceiptUploaded = (updateOrder) => {
    setComprobanteUrl(updateOrder.comprobanteUrl);
    // Propaga el cambio hacia el padre si fue provisto (para actualizar la lista global)
    if (typeof onReceiptUploaded === "function") {
      onReceiptUploaded(updateOrder);
    }
  };

  const handleSavedNote = () => {
    if (typeof onUpdateOrder === "function") {
      onUpdateOrder(order._id, { notas: nota });
      showModal({ title: "Nota", message: "Nota Guardada" });
    } else {
      // safety: should not happen because edit UI is admin-only
      showModal({
        title: "No autorizado",
        message: "No autorizado para guardar la nota",
      });
    }
  };

  const handleCancelOrder = () => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) return;

    if (typeof onUpdateOrder === "function") {
      // 👇 AGREGA ESTA LÍNEA MÁGICA AQUÍ
      console.log("🧐 REVELACIÓN DE ADN. La función conectada se llama:", onUpdateOrder.name);
      
      onUpdateOrder(order._id, { estado: "Cancelado" });
    }
  };

  // Llama al 'gerente' para cambiar el estado
  const [selectedStatus, setSelectedStatus] = useState(order.estado);

  useEffect(() => {
    setSelectedStatus(order.estado);
  }, [order.estado]);

  const handleUpdateStatus = (newStatus) => {
    setSelectedStatus(newStatus);
    onUpdateOrder(order._id, { estado: newStatus });
  };

  return (
    <>
      <tr className="bg-gray-50 odd:bg-gray-50 even:bg-gray-100">
        <td className="px-8 py-4 font-inter text-[14px] text-pretty font-semibold text-gray-900">
          {order.clienteNombre}
        </td>
        <td className="px-8 py-4 b2 text-gray-500">
          {order.items.map((item, i) => (
            <div key={i}>
              {item.cantidad}x {item.nombre}
            </div>
          ))}
        </td>
        <td className="px-8 py-4 font-inter text-[14px] text-pretty font-semibold text-gray-900">
          ${order.total.toFixed(2)}
        </td>
        <td className="px-8 py-4 b2  text-gray-500">
          {new Date(order.createdAt).toLocaleDateString("es-VE", {
            timeZone: "America/Caracas",
          })}
        </td>
        <td className="px-8 py-4">
          <span
            className={`px-2 py-1 rounded  text-xs ${
              order.estado === "Entregado"
                ? "bg-blue-200 b2 py-2 px-4 rounded-4xl text-blue-700"
                : order.estado === "Pago Completado"
                  ? "bg-green-200 b2 py-2 px-4 rounded-4xl text-green-500"
                  : order.estado === "Cancelado"
                    ? "bg-red-200 b2 py-2 px-4 rounded-4xl text-red-700"
                    : "bg-yellow-200 b2 py-2 px-4 rounded-4xl text-yellow-700"
            }`}
          >
            {order.estado}
          </span>
        </td>
        <td className="px-8 py-4 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <img
              src={Dots}
              alt="tres puntos"
              className="cursor-pointer w-8 h-8"
            />
          </button>

          {isModalOpen && (
            <Modal
              onClose={() => setIsModalOpen(false)}
              title="Gestión del Pedido"
            >
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
                    <div className="space-y-4 pt-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Cambiar Estado
                        </p>
                        <select
                          value={selectedStatus}
                          onChange={(e) => handleUpdateStatus(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En preparación">En preparación</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Pago Completado">
                            Pago Completado
                          </option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={handleCancelOrder}
                          className="w-full py-3 md:py-4 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition border border-red-100"
                        >
                          Cancelar Pedido
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.",
                              )
                            ) {
                              onDeleteOrder(order._id);
                              console.log("ID que envío al backend", order._id);
                              setIsModalOpen(false);
                            }
                          }}
                          className="w-full py-3 md:py-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition"
                        >
                          Eliminar Pedido
                        </button>
                      </div>
                    </div>
                  )}

                {!isAdmin && order.estado === "Pendiente" && (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelOrder}
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
        </td>
      </tr>
    </>
  );
};
