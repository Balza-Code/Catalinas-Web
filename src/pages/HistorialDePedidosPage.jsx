import React, { useMemo, useState } from 'react';
import useOrders from '../hooks/useOrders';
import { updateOrder, deleteOrder, uploadReceipt } from '../services/orderService';

const tabs = [
  { id: 'porCobrar', label: 'Por Cobrar / Pendientes' },
  { id: 'porEntregar', label: 'Por Entregar' },
  { id: 'historial', label: 'Historial / Completados' },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export const HistorialDePedidosPage = () => {
  const { orders, setOrders, loading } = useOrders();
  const [activeTab, setActiveTab] = useState('porCobrar');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);

  const ordersWithDebt = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.estado !== 'Cancelado' &&
          order.estado !== 'Pago Completado' &&
          Number(order.total || 0) - Number(order.pagado || 0) > 0,
      ),
    [orders],
  );

  const porEntregarOrders = useMemo(
    () =>
      orders.filter((order) =>
        ['Pendiente', 'En preparación', 'Por Verificar'].includes(order.estado),
      ),
    [orders],
  );

  const historyOrders = useMemo(
    () =>
      orders.filter((order) =>
        ['Pago Completado', 'Cancelado'].includes(order.estado),
      ),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    if (activeTab === 'porCobrar') return ordersWithDebt;
    if (activeTab === 'porEntregar') return porEntregarOrders;
    return historyOrders;
  }, [activeTab, ordersWithDebt, porEntregarOrders, historyOrders]);

  // Apply search filter
  const searchedVisibleOrders = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return visibleOrders;
    return visibleOrders.filter((o) => {
      const name = (o.clienteNombre || '').toLowerCase();
      const id = (o._id || '').toLowerCase();
      const itemsText = (o.items || []).map(it => (it.nombre || '')).join(' ').toLowerCase();
      return name.includes(q) || id.includes(q) || itemsText.includes(q);
    });
  }, [visibleOrders, searchTerm]);

  const urgentCount = useMemo(() => visibleOrders.filter((o) => Boolean(o.urgente)).length, [visibleOrders]);

  const sortedVisibleOrders = useMemo(() => {
    const list = [...searchedVisibleOrders];
    list.sort((a, b) => {
      if (Boolean(a.urgente) && !Boolean(b.urgente)) return -1;
      if (!Boolean(a.urgente) && Boolean(b.urgente)) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (showOnlyUrgent) return list.filter((o) => Boolean(o.urgente));
    return list;
  }, [visibleOrders, showOnlyUrgent]);

  const replaceOrder = (updatedOrder) => {
    setOrders((prev) => prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
  };

  const removeOrder = (deletedId) => {
    setOrders((prev) => prev.filter((order) => order._id !== deletedId));
  };

  const handleUpdateOrder = async (orderId, updateData) => {
    try {
      const updatedOrder = await updateOrder(orderId, updateData);
      replaceOrder(updatedOrder);
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      window.alert('No se pudo actualizar el pedido. Intenta nuevamente.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Eliminar este pedido definitivamente? Esta acción no se puede deshacer.')) return;
    try {
      await deleteOrder(orderId);
      removeOrder(orderId);
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
      window.alert('No se pudo eliminar el pedido. Intenta nuevamente.');
    }
  };

  const toggleUrgency = async (order) => {
    const newVal = !order.urgente;
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, urgente: newVal } : o)));
    try {
      await updateOrder(order._id, { urgente: newVal });
    } catch (error) {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, urgente: order.urgente } : o)));
      console.error('Error al actualizar urgencia:', error);
      window.alert('No se pudo actualizar la urgencia. Intenta nuevamente.');
    }
  };

  const handleEditNotes = async (order) => {
    const updatedNote = window.prompt('Editar notas del pedido:', order.notas || '');
    if (updatedNote === null) return;
    await handleUpdateOrder(order._id, { notas: updatedNote });
  };

  const handleMarkDelivered = async (order) => {
    if (order.estado === 'Cancelado' || order.estado === 'Pago Completado') return;
    await handleUpdateOrder(order._id, { estado: 'Entregado' });
  };

  const handleMarkPaid = async (order) => {
    // open payment modal instead of immediate mark
    if (order.estado === 'Cancelado' || order.estado === 'Pago Completado') return;
    openPaymentModal(order);
  };

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [paymentFile, setPaymentFile] = useState(null);

  const openPaymentModal = (order) => {
    setPaymentOrder(order);
    setPaymentMethod('Efectivo');
    setPaymentCurrency(order.monedaPago || 'USD');
    setPaymentFile(null);
    setPaymentModalOpen(true);
  };
  const closePaymentModal = () => setPaymentModalOpen(false);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentOrder) return;
    try {
      if (paymentMethod === 'Efectivo') {
        const updated = await updateOrder(paymentOrder._id, { estado: 'Pago Completado', pagado: Number(paymentOrder.total || 0), metodoPago: 'Efectivo', monedaPago: paymentCurrency });
        replaceOrder(updated);
      } else {
        // Transferencia / Pago Móvil - upload comprobante
        if (!paymentFile) {
          window.alert('Seleccione un comprobante antes de continuar.');
          return;
        }
        const fd = new FormData();
        fd.append('comprobante', paymentFile);
        fd.append('metodoPago', 'Transferencia/Pago Móvil');
        fd.append('monedaPago', paymentCurrency);
        const updated = await uploadReceipt(paymentOrder._id, fd);
        replaceOrder(updated);
      }
      closePaymentModal();
    } catch (err) {
      console.error('Error procesando pago:', err);
      window.alert('No se pudo procesar el pago. Intenta nuevamente.');
    }
  };

  return (
    <div className="features-layout p-2">
      {/* compact header removed - moved into sidebar for better layout */}

      {loading ? (
        <div className="rounded-card border border-surface-border bg-surface-card p-8 text-center text-slate-500 shadow-sm">Cargando pedidos...</div>
      ) : (
        <div className="grid gap-6 grid-cols-12 items-start">
          {/* SIDEBAR */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3 rounded-card border border-surface-border bg-surface-card p-5 sticky top-6 h-fit shadow-sm">
            <div className="mb-3">
              <h1 className="text-2xl font-semibold text-slate-900">Tablero de Despacho</h1>
              <p className="mt-1 text-sm text-slate-500">Vista simplificada: fecha, cliente y pedido. Ordena por urgencia.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-button px-3 py-1.5 text-sm font-semibold transition border ${
                    activeTab === tab.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface-bg border-surface-border text-slate-600 hover:bg-surface-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
            <p className="mt-2 text-sm text-slate-500">Filtra y busca pedidos por cliente, id o items.</p>
            <div className="mt-4">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente, id o item..."
                className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Pedidos visibles</span>
                <strong className="text-slate-900">{visibleOrders.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Urgentes</span>
                <strong className="text-status-danger">{urgentCount}</strong>
              </div>
              <div className="pt-2 border-t border-surface-border mt-3">
                <button
                  type="button"
                  onClick={() => { setShowOnlyUrgent((s) => !s); setActiveTab('porCobrar'); }}
                  className={`w-full rounded-button px-3 py-2 text-sm font-semibold transition border mt-2 ${showOnlyUrgent ? 'bg-status-danger/10 text-status-danger border-status-danger/20' : 'bg-surface-bg text-slate-600 border-surface-border hover:bg-surface-border'}`}>
                  {showOnlyUrgent ? `Mostrando sólo urgentes (${urgentCount})` : `Mostrar sólo urgentes (${urgentCount})`}
                </button>
              </div>
            </div>
          </aside>

          {/* CARDS */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 auto-rows-min">
          {sortedVisibleOrders.length === 0 ? (
            <div className="col-span-full rounded-card border border-dashed border-surface-border bg-surface-bg p-10 text-center text-slate-500">
              <p className="text-lg font-semibold text-slate-800">No hay pedidos en esta sección.</p>
            </div>
          ) : (
            sortedVisibleOrders.map((order) => {
              const debt = Math.max(0, Number(order.total || 0) - Number(order.pagado || 0));
              const hoursOld = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
              const isUrgent = Boolean(order.urgente) || debt > 0 || (order.estado === 'Pendiente' && hoursOld > 12);
              const firstItem = order.items && order.items.length > 0 ? `${order.items[0].cantidad}x ${order.items[0].nombre}` : 'Sin items';
              const moreItems = order.items && order.items.length > 1 ? ` +${order.items.length - 1} más` : '';
              return (
                <article
                  key={order._id}
                  className={`rounded-card bg-surface-card p-5 sm:p-6 transition relative ${order.urgente ? 'border border-status-danger shadow-md' : 'border border-surface-border shadow-sm hover:shadow-md'} min-h-[120px]`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 border border-brand-100 text-sm font-semibold text-brand-700 shadow-sm">
                        {order.clienteNombre ? order.clienteNombre.split(' ').map(n=>n[0]).slice(0,2).join('') : 'C'}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString('es-VE')}</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">{order.clienteNombre}</h3>
                        <p className="mt-2 text-sm text-slate-600 font-medium">{firstItem}{moreItems}</p>
                        <p className="mt-1 text-xs text-slate-400 font-mono">ID: {String(order._id).slice(-6)}</p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <span className="rounded-button bg-status-danger/10 px-2 py-0.5 text-xs font-semibold text-status-danger border border-status-danger/20">Urgente</span>
                        )}
                        <div className="text-sm font-bold text-slate-800">{formatCurrency(order.total)}</div>
                      </div>
                      <div className="text-xs font-medium text-status-danger">Deuda: {formatCurrency(debt)}</div>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <button
                          onClick={() => toggleUrgency(order)}
                          aria-label={order.urgente ? 'Quitar urgente' : 'Marcar urgente'}
                          className={`rounded-button px-2 py-1 text-xs font-medium whitespace-nowrap transition border ${order.urgente ? 'bg-brand-100 text-brand-800 border-brand-200' : 'bg-surface-bg text-slate-600 border-surface-border hover:bg-surface-border'}`}>
                          {order.urgente ? '★' : '☆'}
                        </button>
                        <button
                          onClick={() => handleMarkPaid(order)}
                          disabled={order.estado === 'Pago Completado' || order.estado === 'Cancelado'}
                          className="rounded-button bg-status-success px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#059669] disabled:opacity-50 whitespace-nowrap transition shadow-sm"
                        >
                          Registrar Pago
                        </button>
                        <button
                          onClick={() => handleMarkDelivered(order)}
                          disabled={order.estado === 'Entregado' || order.estado === 'Pago Completado' || order.estado === 'Cancelado'}
                          className="rounded-button bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 whitespace-nowrap transition shadow-sm"
                        >
                          Marcar Entregado
                        </button>
                        <details className="text-sm text-slate-600 relative">
                          <summary className="cursor-pointer rounded-button bg-surface-bg border border-surface-border px-2 py-1.5 hover:bg-surface-border transition">⋯</summary>
                          <div className="absolute right-0 top-full mt-2 flex flex-col gap-1 rounded-card bg-surface-card border border-surface-border shadow-lg p-2 z-10 w-40">
                            <button onClick={() => handleEditNotes(order)} className="text-left text-sm text-slate-700 hover:bg-surface-bg px-2 py-1.5 rounded-button transition">Editar Notas</button>
                            <button onClick={() => handleUpdateOrder(order._id, { estado: 'Cancelado' })} className="text-left text-sm text-status-danger hover:bg-status-danger/10 px-2 py-1.5 rounded-button transition">Cancelar Pedido</button>
                            <button onClick={() => handleDeleteOrder(order._id)} className="text-left text-sm text-status-danger hover:bg-status-danger/10 px-2 py-1.5 rounded-button transition font-bold">Eliminar Pedido</button>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
          </div>
        </div>
      )}
      {paymentModalOpen && paymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form onSubmit={handlePaymentSubmit} className="w-full max-w-lg rounded-card bg-surface-card border border-surface-border shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800">Registrar pago — {paymentOrder.clienteNombre}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Total a cobrar: <span className="text-slate-800 font-bold">{formatCurrency(paymentOrder.total)}</span></p>
            <div className="mt-5 grid gap-4 border-t border-surface-border pt-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Método de pago</label>
                <select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)} className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia / Pago Móvil</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Moneda</label>
                <select value={paymentCurrency} onChange={(e)=>setPaymentCurrency(e.target.value)} className="w-full rounded-button border border-surface-border bg-surface-bg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500">
                  <option value="USD">USD</option>
                  <option value="Bs">Bs</option>
                </select>
              </div>

              {paymentMethod !== 'Efectivo' && (
                <div className="bg-surface-bg p-4 rounded-card border border-dashed border-surface-border mt-2">
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Comprobante (imagen/pdf)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e)=>setPaymentFile(e.target.files?.[0]||null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer" />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-surface-border pt-4">
              <button type="button" onClick={closePaymentModal} className="rounded-button px-5 py-2 font-medium text-slate-600 hover:bg-surface-bg border border-surface-border transition">Cancelar</button>
              <button type="submit" className="rounded-button bg-brand-500 px-5 py-2 font-bold text-white hover:bg-brand-600 transition shadow-md">Confirmar Pago</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
