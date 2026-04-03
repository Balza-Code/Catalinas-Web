import React, { useState } from "react";
import { useCatalinas } from "../hooks/useCatalinas";
import { createOrder } from "../services/orderService";
import { useModal } from "../context/ModalContext";

export default function POS() {
  const { catalinas, loading } = useCatalinas();
  const { showModal } = useModal();

  const [cart, setCart] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [moneda, setMoneda] = useState("USD");
  const [tasaCambio, setTasaCambio] = useState("");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const availableCatalinas = catalinas.filter(
    (c) => c.disponible && (c.tipoVenta === "detal" || c.tipoVenta === "ambos")
  );

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
  const totalBs = tasaCambio ? (totalUSD * parseFloat(tasaCambio)).toFixed(2) : 0;
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      showModal({ title: "Carrito Vacío", message: "Debes agregar productos para la venta." });
      return;
    }
    if (moneda === "Bs" && (!tasaCambio || isNaN(tasaCambio) || tasaCambio <= 0)) {
      showModal({ title: "Tasa requerida", message: "Ingresa una tasa de cambio válida para operaciones en Bs." });
      return;
    }

    const costoTotalProduccion = cart.reduce(
      (acc, item) => acc + (item.costoProduccion || 0) * item.cantidad,
      0
    );

    const orderData = {
      clienteNombre: "Venta Presencial (POS)",
      items: cart.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        costoProduccion: item.costoProduccion || 0,
      })),
      total: totalUSD,
      costoTotalProduccion: costoTotalProduccion,
      tipoVenta: "Venta Presencial",
      estado: "Entregado",
      pagado: totalUSD, // Siempre pasamos pagado == totalUSD para reflejar que se pago al 100%
      metodoPago: metodoPago,
      monedaPago: moneda,
    };

    try {
      await createOrder(orderData);
      showModal({ title: "Venta Exitosa", message: "La venta presencial se ha registrado!" });
      setCart([]);
      setIsMobileCartOpen(false);
      // Mantenemos la tasa y la moneda iguales por defecto para la proxima venta
    } catch (error) {
      showModal({ title: "Error", message: error.message });
    }
  };

  if (loading) return <div className="p-8 text-center bg-[#f5f0e6] h-full">Cargando POS...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#f5f0e6] overflow-hidden relative">
      {/* PANEL IZQUIERDO: PRODUCTOS */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar h-full pb-32 md:pb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter']">Punto de Venta</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableCatalinas.map((c) => (
            <button
              key={c._id}
              onClick={() => addToCart(c)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all active:scale-95 flex flex-col items-center border border-gray-100 group focus:outline-none"
            >
              <div className="w-24 h-24 mb-3 flex items-center justify-center bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.nombre} className="w-16 h-16 object-contain drop-shadow-md" />
                ) : (
                  <span className="text-amber-300 text-3xl font-bold">+</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-700 text-center leading-tight mb-1">{c.nombre}</h3>
              <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">
                ${c.precio}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTON FLOTANTE MOBILE */}
      <button
        onClick={() => setIsMobileCartOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-amber-600 text-white w-16 h-16 rounded-full shadow-[0_10px_25px_rgba(217,119,6,0.5)] md:hidden transition-transform active:scale-95 flex items-center justify-center focus:outline-none"
      >
        <span className="text-2xl">🛒</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
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
      <div className={`fixed bottom-0 left-0 w-full md:w-96 bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-gray-100 flex flex-col h-[85vh] md:h-full z-50 md:z-10 transition-transform duration-300 md:static ${isMobileCartOpen ? 'translate-y-0 rounded-t-3xl' : 'translate-y-full md:translate-y-0'}`}>
        <div className="p-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center bg-white rounded-t-3xl md:rounded-none">
          <h3 className="text-xl font-bold text-gray-800">Carrito POS</h3>
          <button 
            onClick={() => setIsMobileCartOpen(false)} 
            className="md:hidden p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* LISTA DE ITEMS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-3">🛒</span>
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex-1 mr-3 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{item.nombre}</h4>
                  <p className="text-sm text-gray-500">${item.precio} c/u</p>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg px-2 border border-gray-200">
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 text-lg font-bold hover:bg-red-50 rounded"
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center">{item.cantidad}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 flex items-center justify-center text-green-500 text-lg font-bold hover:bg-green-50 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SETTINGS Y TOTAL */}
        <div className="p-6 bg-slate-50 border-t border-gray-200 flex-shrink-0 rounded-t-3xl md:rounded-none shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">MÉTODO DE PAGO</label>
              <select 
                value={metodoPago} 
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia/Pago Móvil">Transferencia/Digital</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">MONEDA</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  className={`flex-1 py-2.5 text-sm font-bold transition-colors ${moneda === "USD" ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  onClick={() => setMoneda("USD")}
                >
                  USD
                </button>
                <button
                  className={`flex-1 py-2.5 text-sm font-bold transition-colors ${moneda === "Bs" ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  onClick={() => setMoneda("Bs")}
                >
                  Bs
                </button>
              </div>
            </div>
          </div>

          {moneda === "Bs" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">TASA DE CAMBIO (Bs/USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                <input 
                  type="number" 
                  step="0.01" 
                  value={tasaCambio}
                  onChange={(e) => setTasaCambio(e.target.value)}
                  placeholder="Ej: 36.5"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-bold">TOTAL</span>
            <div className="text-right">
              {moneda === "Bs" && !!tasaCambio ? (
                <>
                  <div className="text-3xl font-black text-gray-800">Bs. {totalBs}</div>
                  <div className="text-sm font-medium text-gray-400">${totalUSD.toFixed(2)} USD</div>
                </>
              ) : (
                <div className="text-3xl font-black text-gray-800">${totalUSD.toFixed(2)}</div>
              )}
            </div>
          </div>

          <button 
            onClick={handleProcessSale}
            disabled={cart.length === 0}
            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-transform text-lg active:scale-95 flex items-center justify-center gap-2 ${
              cart.length === 0 ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-amber-600 hover:bg-amber-700 hover:shadow-xl"
            }`}
          >
            <span>Procesar Venta</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}
