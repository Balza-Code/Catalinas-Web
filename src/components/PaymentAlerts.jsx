// src/components/PaymentAlerts.jsx
import { useMemo } from 'react';

// Días de gracia antes de que un pedido aparezca como alerta
const DIAS_DE_GRACIA = 7; 

function PaymentAlerts({ orders }) {

  // Usamos useMemo para que este cálculo pesado solo se ejecute si la lista de 'orders' cambia.
  const pedidosMorosos = useMemo(() => {
    const ahora = new Date();
    
    return orders.filter(order => {
      // Excluir pedidos ya completados o cancelados explícitamente
      if (order.estado === 'Pago Completado' || order.estado === 'Cancelado') return false;

      // Regla 1: Debe estar 'Entregado' (solo los entregados pueden considerarse morosos)
      if (order.estado !== 'Entregado') return false;

      // Regla 2: No debe estar pagado (doble chequeo si existe campo montoPagado)
      if (order.montoPagado != null && order.montoPagado >= order.total) return false;

      // Regla 3: Debe tener más de X días desde la última actualización (ej. fecha de entrega)
      const fechaEntrega = new Date(order.updatedAt);
      const diffTiempo = ahora.getTime() - fechaEntrega.getTime();
      const diffDias = diffTiempo / (1000 * 3600 * 24);

      return diffDias > DIAS_DE_GRACIA;
    });

  }, [orders]); // Se recalcula solo si 'orders' cambia

  // Si no hay pedidos morosos, no muestra nada.
  if (pedidosMorosos.length === 0) {
    return null;
  }

  // Si hay, muestra un panel de alerta
  return (
    <div className="payment-alerts">
      <h3>⚠️ Alerta de Pagos Atrasados</h3>
      <p>Los siguientes pedidos fueron entregados hace más de {DIAS_DE_GRACIA} días y aún tienen saldo pendiente:</p>
      <ul>
        {pedidosMorosos.map(order => (
          <li key={order._id}>
            <strong>{order.clienteNombre}</strong> (Pedido del {new Date(order.createdAt).toLocaleDateString()})
            - <span style={{ color: 'red' }}>Debe: Lo indicado en las notas</span>
            - <i>Notas: {order.notas || 'Sin notas'}</i>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentAlerts;