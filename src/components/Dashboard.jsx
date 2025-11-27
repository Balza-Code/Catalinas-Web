import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { OrderList } from "./OrderList";
import ResumenVentasRecientes from "./ResumenVentasRecientes";

// Este component e recibe la lisra completa de pedidos como props
const Dashboard = ({ orders }) => {
  // Usamos useMemo para que los cáculos solo se rehagan si la lista de 'orders' cambia
  // Es una optimizacion para que la app sea más rapida

  const stats = useMemo(() => {
    // Considerar estados que generan ingresos: 'Entregado' y 'Pago Completado'
    const revenueStatuses = ["Entregado", "Pago Completado"];
    const deliveredOrders = orders.filter((order) =>
      revenueStatuses.includes(order.estado)
    );

    // Ingresos totales
    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    );

    // Número total de ventas
    const totalSales = deliveredOrders.length;

    // Ventas por tipo
    const onlineSales = deliveredOrders.filter(
      (o) => o.tipoVenta === "Pedido Online"
    ).length;
    const detalSales = deliveredOrders.filter(
      (o) => o.tipoVenta === "Venta Detal"
    ).length;

    return {
      totalRevenue,
      totalSales,
      onlineSales,
      detalSales,
    };
  }, [orders]); // El cálculo se vuelve a ejecutar solo si 'orders' cambia

  // Generar datos para el gráfico a partir de los pedidos entregados
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const revenueStatuses = ["Entregado", "Pago Completado"];
    // Map key: yyyy-mm (for sorting), value: { revenue, date }
    const map = new Map();

    orders.forEach((o) => {
      if (!revenueStatuses.includes(o.estado)) return;
      const dateRaw = o.createdAt || o.fecha || o.date;
      let d = null;
      if (dateRaw) {
        const parsed = new Date(dateRaw);
        if (!isNaN(parsed)) d = parsed;
      }
      // Fallback to current date if none
      if (!d) d = new Date();

      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const label = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      const prev = map.get(key) || {
        revenue: 0,
        label,
        date: new Date(year, month - 1, 1),
      };
      prev.revenue += Number(o.total) || 0;
      map.set(key, prev);
    });

    // Convert map to sorted array by month
    const arr = Array.from(map.entries())
      .map(([key, { revenue, label, date }]) => ({
        key,
        name: label,
        revenue,
        date,
      }))
      .sort((a, b) => a.date - b.date)
      .map(({ name, revenue }) => ({ name, revenue }));

    if (arr.length === 0) {
      return [
        { name: "Ene", revenue: 0 },
        { name: "Feb", revenue: 0 },
        { name: "Mar", revenue: 0 },
      ];
    }

    return arr;
  }, [orders]);

  return (
    <div className="flex flex-col gap-4 w-full h-full bg-[#f5f0e6] ">
      {/* Tarjetas de estadísticas */}
      <div
        className="
    flex                
    overflow-x-auto     
    gap-4               
    -mt-16              
    -mx-4 px-4          
    no-scrollbar        
    
    
    
    md:grid 
    md:grid-cols-2      
    lg:grid-cols-4      
    md:overflow-visible 
    md:mx-0 md:px-0     
    md:pb-0
    md:mt-0             "
      >
        <div className="flex flex-col justify-center bg-white rounded-lg shadow p-6 md:p-4 gap-4 min-h-[115px] md:min-h-0 shrink-0 min-w-[215px] md:min-w-0 ">
          <h3 className="font-dm-sans text-xl/tight text-pretty font-medium md:text-sm text-gray-400">Ingresos Totales</h3>
          <p className="font-dm-sans text-[28px]/tight text-pretty font-semibold md:text-lg text-gray-700">
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-col justify-center bg-white rounded-lg shadow p-6 md:p-4 gap-3 min-h-[115px] md:min-h-0 shrink-0 min-w-[215px] md:min-w-0 ">
          <h3 className="font-dm-sans text-xl/tight text-pretty font-medium md:text-sm text-gray-400">Ventas Totales</h3>
          <p className="font-dm-sans text-[28px]/tight text-pretty font-semibold md:text-lg text-gray-700">
            {stats.totalSales}
          </p>
        </div>
        <div className="flex flex-col justify-center bg-white rounded-lg shadow p-6 md:p-4 gap-3 min-h-[115px] md:min-h-0 shrink-0 min-w-[215px] md:min-w-0 ">
          <h3 className="font-dm-sans text-xl/tight text-pretty font-medium md:text-sm text-gray-400">Pedidos Online Totales</h3>
          <p className="font-dm-sans text-[28px]/tight text-pretty font-semibold md:text-lg text-gray-700">
            {stats.onlineSales}
          </p>
        </div>
        <div className="flex flex-col justify-center bg-white rounded-lg shadow p-6 md:p-4 gap-3 min-h-[115px] md:min-h-0 shrink-0 min-w-[215px] md:min-w-0 ">
          <h3 className="font-dm-sans text-xl/tight text-pretty font-medium md:text-sm text-gray-400">Pedidos al detal</h3>
          <p className="font-dm-sans text-[28px]/tight text-pretty font-semibold md:text-lg text-gray-700">
            {stats.detalSales}
          </p>
        </div>
      </div>

      {/* Contenedor de gráfico y resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4 w-full">
        {/* Gráfico */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-xl md:text-base font-dm-sans font-medium text-left text-gray-600 mb-4 lg:text-left">
            Rendimiento Mensual
          </h3>
          <div className="w-full h-72 md:h-[90%] pr-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#c084fc" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumen de ventas recientes */}
        <div className="bg-white rounded-lg shadow p-4 max-h-[450px] md:max-w-[95.5%] overflow-y-auto no-scrollbar">
          <h3 className="text-xl md:text-base font-dm-sans font-medium text-left text-gray-600 mb-2 ">
            Últimos Movimientos
          </h3>
          <ResumenVentasRecientes orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
