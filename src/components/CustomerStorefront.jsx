import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";

export default function CustomerStorefront({ catalinas = [], onOrderPlace }) {
  const { user } = useContext(AuthContext);
  const { showModal } = useModal();

  const [cart, setCart] = useState([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [notas, setNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (catalina) => {
    const existing = cart.find((item) => item._id === catalina._id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item._id === catalina._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...catalina, cantidad: 1 }]);
    }
  };

  const removeFromCart = (catalinaId) => {
    const existing = cart.find((item) => item._id === catalinaId);
    if (!existing) return;
    if (existing.cantidad === 1) {
      setCart(cart.filter((item) => item._id !== catalinaId));
    } else {
      setCart(
        cart.map((item) =>
          item._id === catalinaId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
      );
    }
  };

  const totalUSD = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      showModal({ title: "Carrito vacío", message: "Debes agregar productos a tu pedido." });
      return;
    }

    if (!user || !user.nombre) {
        showModal({ title: "Error", message: "No se identificó al usuario." });
        return;
    }

    const orderData = {
      clienteNombre: user.nombre,
      items: cart.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        costoProduccion: item.costoProduccion || 0,
      })),
      total: parseFloat(totalUSD.toFixed(2)),
      tipoVenta: "Pedido Online",
      estado: "Pendiente", 
      notas,
    };

    try {
      setIsSubmitting(true);
      await onOrderPlace(orderData);
      showModal({ title: "Pedido enviado", message: "Tu pedido ha sido registrado y enviado al horno con éxito." });
      setCart([]);
      setIsMobileCartOpen(false);
      setNotas("");
    } catch (error) {
      showModal({ title: "Error", message: error.message || "No se pudo procesar tu pedido." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-surface-bg overflow-hidden relative rounded-card border border-surface-border shadow-sm">
      {/* PANEL IZQUIERDO: PRODUCTOS */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar h-full pb-32 md:pb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter']">Realizar un Pedido</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {catalinas.map((c) => (
            <button
              key={c._id}
              onClick={() => addToCart(c)}
              className="bg-surface-card rounded-card p-4 shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center border border-surface-border group focus:outline-none"
            >
              <div className="w-24 h-24 mb-3 flex items-center justify-center bg-brand-50 rounded-full group-hover:bg-brand-100 transition-colors">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.nombre} className="w-16 h-16 object-contain drop-shadow-md" />
                ) : (
                  <span className="text-brand-300 text-3xl font-bold">+</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-700 text-center leading-tight mb-1">{c.nombre}</h3>
              <p className="text-xs text-gray-500 text-center mb-2 line-clamp-2">{c.descripcion}</p>
              <span className="text-brand-600 font-bold bg-brand-50 px-3 py-1 rounded-full text-sm">
                ${Number(c.precio || 0).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTON FLOTANTE MOBILE */}
      <button
        onClick={() => setIsMobileCartOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-brand-500 text-white w-16 h-16 rounded-full shadow-2xl md:hidden transition-transform active:scale-95 flex items-center justify-center focus:outline-none"
      >
        <span className="text-2xl">🛒</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-status-danger text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {totalItems}
          </span>
        )}
      </button>

      {/* PANEL DERECHO: TICKET DE VENTA */}
      {isMobileCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileCartOpen(false)}
        />
      )}
      <div className={`fixed bottom-0 left-0 w-full md:w-96 bg-surface-card shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] border-l border-surface-border flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] z-40 md:z-10 transition-transform duration-300 md:static ${isMobileCartOpen ? 'translate-y-0 rounded-t-card' : 'translate-y-full md:translate-y-0'}`}>
        <div className="p-5 border-b border-surface-border shrink-0 flex justify-between items-center bg-surface-card rounded-t-card md:rounded-none">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Tu Pedido</h3>
            <p className="text-sm text-gray-500">Se enviará a producción</p>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(false)}
            className="md:hidden p-2 bg-surface-bg rounded-full text-gray-500 hover:bg-surface-border"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-bg">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-3">🛒</span>
              <p>Tu pedido está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-surface-card p-3 rounded-card border border-surface-border shadow-sm">
                <div className="flex-1 mr-3 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{item.nombre}</h4>
                  <p className="text-sm text-gray-500">${Number(item.precio || 0).toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-3 bg-surface-bg rounded-button px-2 border border-surface-border">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="w-8 h-8 flex items-center justify-center text-status-danger text-lg font-bold hover:bg-status-danger/10 rounded"
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center text-gray-700">{item.cantidad}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 flex items-center justify-center text-status-success text-lg font-bold hover:bg-status-success/10 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="space-y-3 bg-surface-card rounded-card border border-surface-border p-4 shadow-sm mt-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">Comentarios o Notas extras</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Pasaré a recogerlas a las 3:00 PM o Envía con delivery."
              rows={3}
              className="w-full resize-none rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-auto sticky bottom-0 bg-surface-card border-t border-surface-border p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-bold">Total a Pagar</span>
            <div className="text-right">
                <div className="text-3xl font-black text-gray-800">${totalUSD.toFixed(2)}</div>
            </div>
          </div>
          <button
            onClick={handleProcessSale}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full py-4 text-white font-bold rounded-button shadow-lg transition-transform text-lg active:scale-95 flex items-center justify-center gap-2 ${
              cart.length === 0 || isSubmitting ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-brand-500 hover:bg-brand-600 hover:shadow-xl"
            }`}
          >
            <span>{isSubmitting ? "Enviando..." : "Enviar mi Pedido"}</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}
