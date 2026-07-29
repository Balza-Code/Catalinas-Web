import React, { useState } from "react";
import Modal from "../components/Modal";
import { useCatalinas } from "../hooks/useCatalinas";
import { useAdmin } from "../hooks/useAdmin";
import { createOrder } from "../services/orderService";
import { createAdminCliente } from "../services/adminService";
import { useModal } from "../context/ModalContext";

export default function POS() {
  const token = localStorage.getItem("token");
  const { catalinas, loading } = useCatalinas();
  const { clientes, loading: adminLoading, error: adminError, refreshClientes } = useAdmin(token);
  const { showModal } = useModal();

  const [cart, setCart] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [moneda, setMoneda] = useState("USD");
  const [tasaCambio, setTasaCambio] = useState("");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [selectedClienteName, setSelectedClienteName] = useState("Consumidor Final");
  const [newClienteName, setNewClienteName] = useState("");
  const [newClientePhone, setNewClientePhone] = useState("");
  const [isCreatingCliente, setIsCreatingCliente] = useState(false);
  const [isRegisteringClient, setIsRegisteringClient] = useState(false);
  const [pedidoEstado, setPedidoEstado] = useState("Pendiente");
  const [pagoEstado, setPagoEstado] = useState("Pendiente de Pago");
  const [notas, setNotas] = useState("");

  const isDigitalPayment = metodoPago === "Transferencia/Pago Móvil";

  const normalizeText = (value) =>
    value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const availableCatalinas = catalinas.filter((c) => {
    if (!c.disponible) return false;
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'detal') return c.tipoVenta === 'detal' || c.tipoVenta === 'ambos';
    if (filtroTipo === 'mayor') return c.tipoVenta === 'online' || c.tipoVenta === 'ambos';
    return true;
  });

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

  const normalizedSearch = normalizeText(clienteSearch);

  const filteredClientes = clientes.filter((cliente) => {
    if (!normalizedSearch) return true;
    const nombre = normalizeText(cliente.nombre || '');
    const email = normalizeText(cliente.email || '');
    return nombre.includes(normalizedSearch) || email.includes(normalizedSearch);
  });

  const selectCliente = (cliente) => {
    setSelectedClienteId(cliente.userId || cliente._id || '');
    setSelectedClienteName(cliente.nombre || 'Cliente Registrado');
    setClienteSearch(cliente.nombre || '');
    setClienteDropdownOpen(false);
  };

  const handleClearSelectedCliente = () => {
    setSelectedClienteId('');
    setSelectedClienteName('Consumidor Final');
    setClienteSearch('');
    setClienteDropdownOpen(false);
  };

  const handleOpenRegisterClientModal = (prefillName = '') => {
    setNewClienteName(prefillName);
    setNewClientePhone('');
    setIsCreatingCliente(false);
    setClienteDropdownOpen(false);

    showModal({
      title: 'Registrar Cliente Express',
      children: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={newClienteName}
              onChange={(e) => setNewClienteName(e.target.value)}
              className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
            <input
              type="text"
              value={newClientePhone}
              onChange={(e) => setNewClientePhone(e.target.value)}
              className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Opcional"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                hideModal();
              }}
              className="rounded-button border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-surface-bg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateNewCliente}
              disabled={!newClienteName.trim() || isCreatingCliente}
              className={`rounded-button px-4 py-3 text-sm font-semibold text-white transition ${newClienteName.trim() && !isCreatingCliente ? 'bg-brand-500 hover:bg-brand-600' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isCreatingCliente ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </div>
      ),
      onClose: hideModal,
    });
  };

  const handleCreateNewCliente = async () => {
    if (!newClienteName.trim()) return;
    if (!token) {
      showModal({ title: "Sesión inválida", message: "No se encontró token de autenticación." });
      return;
    }

    try {
      setIsCreatingCliente(true);
      const created = await createAdminCliente(token, {
        nombre: newClienteName.trim(),
        phone: newClientePhone.trim() || undefined,
      });
      hideModal();
      showModal({
        title: "Cliente creado",
        message: `Cliente ${created.nombre} registrado con éxito.`,
      });
      setSelectedClienteId(created.userId || created._id || "");
      setSelectedClienteName(created.nombre);
      setClienteSearch(created.nombre);
      setNewClienteName("");
      setNewClientePhone("");
      refreshClientes();
    } catch (error) {
      showModal({ title: "Error al crear cliente", message: error.message || "No se pudo registrar el cliente." });
    } finally {
      setIsCreatingCliente(false);
    }
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      showModal({ title: "Carrito vacío", message: "Debes agregar productos para la venta." });
      return;
    }
    if (!isDigitalPayment && moneda === "Bs" && (!tasaCambio || isNaN(tasaCambio) || parseFloat(tasaCambio) <= 0)) {
      showModal({ title: "Tasa requerida", message: "Ingresa una tasa de cambio válida para operaciones en Bs." });
      return;
    }

    const effectiveMoneda = isDigitalPayment ? "USD" : moneda;
    const totalFinal = effectiveMoneda === "Bs" ? parseFloat(totalBs) : parseFloat(totalUSD.toFixed(2));
    const costoTotalProduccion = cart.reduce(
      (acc, item) => acc + (item.costoProduccion || 0) * item.cantidad,
      0
    );

    const orderData = {
      clienteNombre: selectedClienteName || "Consumidor Final",
      userId: selectedClienteId || "",
      items: cart.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        costoProduccion: item.costoProduccion || 0,
      })),
      total: totalFinal,
      costoTotalProduccion,
      tipoVenta: "Venta Omnicanal",
      estadoPedido: pedidoEstado,
      estadoPago: pagoEstado,
      pagado: pagoEstado === "Pago Completado" ? totalFinal : 0,
      metodoPago,
      monedaPago: effectiveMoneda,
      tasaCambio: !isDigitalPayment && effectiveMoneda === "Bs" ? parseFloat(tasaCambio) : undefined,
      notas,
    };

    try {
      await createOrder(orderData);
      showModal({ title: "Venta registrada", message: "El pedido se creó correctamente." });
      setCart([]);
      setIsMobileCartOpen(false);
      setPedidoEstado("Pendiente");
      setPagoEstado("Pendiente de Pago");
      setNotas("");
      setSelectedClienteId("");
      setSelectedClienteName("Consumidor Final");
    } catch (error) {
      showModal({ title: "Error", message: error.message || "No se pudo procesar la venta." });
    }
  };

  if (loading || adminLoading) return <div className="p-8 text-center bg-surface-bg h-full">Cargando POS...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-surface-bg overflow-hidden relative">
      {/* PANEL IZQUIERDO: PRODUCTOS */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar h-full pb-32 md:pb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 font-['Inter']">Centro de Creación de Pedidos</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'detal', label: 'Detal' },
            { key: 'mayor', label: 'Mayor' },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setFiltroTipo(filter.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filtroTipo === filter.key ? 'bg-brand-500 text-white' : 'bg-surface-card text-gray-700 border border-surface-border hover:bg-surface-border'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableCatalinas.map((c) => (
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
              <span className="text-brand-600 font-bold bg-brand-50 px-3 py-1 rounded-full text-sm">
                ${c.precio}
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
            <h3 className="text-xl font-bold text-gray-800">Ticket de Venta</h3>
            <p className="text-sm text-gray-500">Registra cualquier venta sin cerrar sesión.</p>
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
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center bg-surface-card p-3 rounded-card border border-surface-border shadow-sm">
                <div className="flex-1 mr-3 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{item.nombre}</h4>
                  <p className="text-sm text-gray-500">${item.precio} c/u</p>
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

          <div className="space-y-3 bg-surface-card rounded-card border border-surface-border p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Cliente / CRM</p>
                <p className="text-xs text-gray-500">Selecciona cliente o usa Consumidor Final.</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-700">Omnicanal</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={clienteSearch}
                onChange={(e) => {
                  setClienteSearch(e.target.value);
                  setClienteDropdownOpen(true);
                }}
                onFocus={() => setClienteDropdownOpen(true)}
                onBlur={() => setTimeout(() => setClienteDropdownOpen(false), 150)}
                placeholder="Buscar cliente..."
                className="w-full rounded-button border border-surface-border px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 bg-surface-bg outline-none"
              />
              {clienteDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-card border border-surface-border bg-white shadow-lg max-h-72 overflow-y-auto">
                  {filteredClientes.length > 0 ? (
                    filteredClientes.map((cliente) => (
                      <button
                        key={cliente.userId ?? cliente._id}
                        type="button"
                        onMouseDown={() => selectCliente(cliente)}
                        className="w-full text-left px-4 py-3 hover:bg-brand-50"
                      >
                        <div className="text-sm font-semibold text-slate-800">{cliente.nombre}</div>
                        <div className="text-xs text-gray-500">{cliente.email || 'Sin email registrado'}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">Ningún cliente coincide con "{clienteSearch}"</div>
                  )}
                  {clienteSearch.trim() && (
                    <button
                      type="button"
                      onMouseDown={() => {
                        setIsRegisteringClient(true);
                        setNewClienteName(clienteSearch.trim());
                        setNewClientePhone('');
                      }}
                      className="w-full text-left border-t border-surface-border px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      + Registrar "{clienteSearch.trim()}" como nuevo cliente
                    </button>
                  )}
                </div>
              )}
            </div>
            {selectedClienteId && selectedClienteName !== 'Consumidor Final' ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-slate-700">
                <span>👤 {selectedClienteName}</span>
                <button
                  type="button"
                  onClick={handleClearSelectedCliente}
                  className="text-brand-600 font-semibold hover:text-brand-700"
                >
                  (x)
                </button>
              </div>
            ) : null}
            {adminError && (
              <p className="text-sm text-status-danger">Error cargando clientes: {adminError}</p>
            )}
            <button
              type="button"
              onClick={() => setIsRegisteringClient(true)}
              className="w-full rounded-button border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition"
            >
              Registrar Nuevo Cliente Físico
            </button>
          </div>
          {isRegisteringClient && (
            <Modal open={isRegisteringClient} title="Registrar Cliente Express" onClose={() => setIsRegisteringClient(false)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={newClienteName}
                    onChange={(e) => setNewClienteName(e.target.value)}
                    className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={newClientePhone}
                    onChange={(e) => setNewClientePhone(e.target.value)}
                    className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="Opcional"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRegisteringClient(false)}
                    className="rounded-button border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-surface-bg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewCliente}
                    disabled={!newClienteName.trim() || isCreatingCliente}
                    className={`rounded-button px-4 py-3 text-sm font-semibold text-white transition ${newClienteName.trim() && !isCreatingCliente ? 'bg-brand-500 hover:bg-brand-600' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {isCreatingCliente ? 'Guardando...' : 'Guardar cliente'}
                  </button>
                </div>
              </div>
            </Modal>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-3 bg-surface-card rounded-card border border-surface-border p-4 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">Estado del Pedido</label>
              <select
                value={pedidoEstado}
                onChange={(e) => setPedidoEstado(e.target.value)}
                className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Procesando">Procesando</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>
            <div className="space-y-3 bg-surface-card rounded-card border border-surface-border p-4 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">Estado de Pago</label>
              <select
                value={pagoEstado}
                onChange={(e) => setPagoEstado(e.target.value)}
                className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="Pendiente de Pago">Pendiente de Pago</option>
                <option value="Pago Completado">Pago Completado</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 bg-surface-card rounded-card border border-surface-border p-4 shadow-sm">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">Notas operativas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Entregar a las 3PM, envío capture por WhatsApp"
              rows={3}
              className="w-full resize-none rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-card border border-surface-border bg-surface-card p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">Método de Pago</p>
              <select
                value={metodoPago}
                onChange={(e) => {
                  const selectedMethod = e.target.value;
                  setMetodoPago(selectedMethod);
                  if (selectedMethod === "Transferencia/Pago Móvil") {
                    setMoneda("USD");
                    setTasaCambio("");
                  }
                }}
                className="mt-2 w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia/Pago Móvil">Digital</option>
              </select>
            </div>
            <div className="rounded-card border border-surface-border bg-surface-card p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.12em]">Moneda</p>
              <div className="mt-2 flex rounded-button overflow-hidden border border-surface-border">
                <button
                  className={`flex-1 py-2 text-sm font-bold transition ${moneda === "USD" ? "bg-brand-500 text-white" : "bg-surface-bg text-gray-600 hover:bg-surface-border"}`}
                  onClick={() => setMoneda("USD")}
                >
                  USD
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-bold transition ${moneda === "Bs" ? "bg-brand-500 text-white" : "bg-surface-bg text-gray-600"} ${isDigitalPayment ? 'cursor-not-allowed opacity-50' : 'hover:bg-surface-border'}`}
                  onClick={() => !isDigitalPayment && setMoneda("Bs")}
                  disabled={isDigitalPayment}
                  title={isDigitalPayment ? 'Bs no disponible para pago digital' : ''}
                >
                  Bs
                </button>
              </div>
            </div>
          </div>

          {!isDigitalPayment && moneda === "Bs" && (
            <div className="mb-4 rounded-card border border-surface-border bg-surface-card p-4 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Tasa de cambio (Bs/USD)</label>
              <input
                type="number"
                step="0.01"
                value={tasaCambio}
                onChange={(e) => setTasaCambio(e.target.value)}
                placeholder="Ej: 36.5"
                className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          )}
        </div>

        <div className="mt-auto sticky bottom-0 bg-surface-card border-t border-surface-border p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-bold">Total</span>
            <div className="text-right">
              {isDigitalPayment ? (
                <div className="text-3xl font-black text-gray-800">${totalUSD.toFixed(2)}</div>
              ) : moneda === "Bs" && !!tasaCambio ? (
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
            className={`w-full py-4 text-white font-bold rounded-button shadow-lg transition-transform text-lg active:scale-95 flex items-center justify-center gap-2 ${
              cart.length === 0 ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-brand-500 hover:bg-brand-600 hover:shadow-xl"
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
