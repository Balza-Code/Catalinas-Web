import { useMemo } from 'react';

// Este component e recibe la lisra completa de pedidos como props
const Dashboard = ({ orders }) => {
  // Usamos useMemo para que los cáculos solo se rehagan si la lista de 'orders' cambia
  // Es una optimizacion para que la app sea más rapida

  const stats = useMemo(() => {
    // 1. Filtramos solo los pedidos que han sido ntregados ( los que generan ingresos )
    const deliveredOrders = orders.filter(order => order.estado === 'Entregado');


    // 2. Calculamos los ingresos totales sumando el total de cada pedido entregado
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    
    // 3. Contamos el número total de ventas completadas
    const totalSales = deliveredOrders.length;

    // 4. Contamos cuántas ventas son de cad tipo 
    const onlineSales = deliveredOrders.filter(o => o.tipoVenta === 'Pedido Online').length;
    const detalSales = deliveredOrders.filter(o => o.tipoVenta === 'Venta Detal').length;

    return {
      totalRevenue,
      totalSales,
      onlineSales,
      detalSales
    };
  }, [orders]) // El cálculo se vuelve a ejecutar solo si 'orders' cambia

  return (
    <div className='dashboard'>
      <h2>Resumen de ventas</h2>
      <div className='stats-container'>
        <div className='stat-card'>
          <h3>Ingresos Totales</h3>
          <p>${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className='stat-card'>
          <h3>Ventas Totales</h3>
          <p>{stats.totalSales}</p>
        </div>

        <div className='stat-card'>
          <h3>Pedidos Online Totales</h3>
          <p>{stats.onlineSales}</p>
        </div>

        <div className='stat-card'>
          <h3>Pedidos al detal</h3>
          <p>{stats.detalSales}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;