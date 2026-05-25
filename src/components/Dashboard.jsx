import { useMemo } from "react";

// Action Center dashboard: tarjetas de urgencia + próximas acciones
const Dashboard = ({ orders = [] }) => {
  const stats = useMemo(() => {
    const revenueStatuses = ["Entregado", "Pago Completado"];
    const deliveredOrders = orders.filter((order) => revenueStatuses.includes(order.estado));

    const totalRevenue = orders.reduce((sum, order) => {
      if (order.estado === "Pago Completado") {
        return sum + (Number(order.total) || 0);
      } else if (order.estado !== "Cancelado") {
        return sum + (Number(order.pagado) || 0);
      }
      return sum;
    }, 0);

    const totalSales = deliveredOrders.length;
    const onlineSales = deliveredOrders.filter((o) => o.tipoVenta === "Pedido Online").length;
    const detalSales = deliveredOrders.filter((o) => o.tipoVenta === "Venta Detal").length;

    const totalCuentasPorCobrar = orders.reduce((sum, order) => {
      if (order.estado === "Cancelado" || order.estado === "Pago Completado") return sum;
      const deudaDelPedido = Number(order.total) - Number(order.pagado || 0);
      return sum + deudaDelPedido;
    }, 0);

    return { totalRevenue, totalSales, onlineSales, detalSales, totalCuentasPorCobrar };
  }, [orders]);

  const todays = useMemo(() => {
    const now = new Date();
    const isSameDay = (d) => {
      if (!d) return false;
      const x = new Date(d);
      return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth() && x.getDate() === now.getDate();
    };

    const deliveriesToday = orders.filter(
      (o) => isSameDay(o.fechaEntrega || o.deliveryDate || o.createdAt) || (o.estado === "Procesando" && !o.fechaEntrega)
    ).length;

    const productionInProgress = orders.filter(
      (o) => (o.tipoVenta || "").toLowerCase().includes("produ") && o.estado === "Procesando"
    ).length;

    return { deliveriesToday, productionInProgress };
  }, [orders]);

  const urgentOrders = useMemo(() => {
    return orders
      .filter((o) => o.estado !== "Cancelado")
      .map((o) => ({
        ...o,
        deuda: Math.max(0, Number(o.total || 0) - Number(o.pagado || 0)),
        date: new Date(o.createdAt || o.fecha || Date.now()),
      }))
      .sort((a, b) => {
        // 1. Prioridad a marcados explícitamente como urgentes
        if (a.urgente && !b.urgente) return -1;
        if (!a.urgente && b.urgente) return 1;
        
        // 2. Prioridad a estados que requieren atención (Pendiente y Procesando)
        const aNeedsAttention = a.estado === "Pendiente" || a.estado === "Procesando";
        const bNeedsAttention = b.estado === "Pendiente" || b.estado === "Procesando";
        if (aNeedsAttention && !bNeedsAttention) return -1;
        if (!aNeedsAttention && bNeedsAttention) return 1;

        // 3. Prioridad de cobro (quien debe más dinero)
        if (b.deuda !== a.deuda) return b.deuda - a.deuda;

        // 4. Si todo es igual, mostrar siempre los MÁS RECIENTES primero
        return b.date - a.date;
      })
      .slice(0, 6);
  }, [orders]);

  return (
    <div className="flex flex-col gap-4 w-full h-full bg-surface-bg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`bg-surface-card rounded-card border border-surface-border shadow-sm p-4 flex flex-col justify-between`}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pedidos para entregar</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className={`text-4xl font-black ${todays.deliveriesToday > 0 ? "text-brand-600" : "text-slate-800"}`}>{todays.deliveriesToday}</div>
              <p className="text-xs font-medium text-slate-500">Hoy</p>
            </div>
            <div className="text-right text-xs font-semibold text-brand-500 bg-brand-50 px-2 py-1 rounded-full">Acción: Preparar rutas</div>
          </div>
        </div>

        <div className="bg-surface-card rounded-card border border-surface-border shadow-sm p-4 flex flex-col justify-between">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Cobros Pendientes</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-3xl font-black text-status-danger">${stats.totalCuentasPorCobrar.toFixed(2)}</div>
              <p className="text-xs font-medium text-slate-500">USD Pendientes</p>
            </div>
            <div className="text-right text-xs font-semibold text-status-danger bg-status-danger/10 px-2 py-1 rounded-full">Acción: Contactar clientes</div>
          </div>
        </div>

        <div className="bg-surface-card rounded-card border border-surface-border shadow-sm p-4 flex flex-col justify-between">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Producción</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-4xl font-black text-brand-500">{todays.productionInProgress}</div>
              <p className="text-xs font-medium text-slate-500">Tandas en proceso</p>
            </div>
            <div className="text-right text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">Acción: Supervisar avance</div>
          </div>
        </div>
      </div>

      <div className="bg-surface-card rounded-card border border-surface-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
          <h3 className="text-lg font-bold text-slate-800">Próximas Acciones</h3>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-surface-bg px-3 py-1 rounded-button">Pedidos Urgentes</span>
        </div>
        <ul className="space-y-3">
          {urgentOrders.length === 0 ? (
            <li className="text-sm text-center py-6 text-slate-500 font-medium">No hay acciones urgentes pendientes. ¡Todo al día! 🎉</li>
          ) : (
            urgentOrders.map((o) => (
              <li key={o._id || o.id} className="flex items-center justify-between gap-3 p-4 bg-surface-bg rounded-card border border-surface-border hover:shadow-sm transition">
                <div className="min-w-0">
                  <div className="font-bold text-base text-slate-800 truncate">{o.clienteNombre || o.cliente || 'Cliente sin nombre'}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1 truncate">
                    <span className="bg-surface-card border border-surface-border px-1.5 py-0.5 rounded mr-2 font-mono">#{String(o._id || o.id).slice(-6)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${o.estado === 'Procesando' ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-700'}`}>
                      {o.estado}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <div className="text-sm font-black text-slate-800">${(Number(o.total) || 0).toFixed(2)}</div>
                  {o.deuda > 0 && <div className="text-xs font-bold text-status-danger bg-status-danger/10 px-2 py-0.5 rounded-full mt-1 inline-block text-right">Deuda: ${o.deuda.toFixed(2)}</div>}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
