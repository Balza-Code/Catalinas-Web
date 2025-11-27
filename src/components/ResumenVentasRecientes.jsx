import React from 'react';


// Componente "átomo" para la etiqueta de estado (Badge)
// Es una buena práctica separarlo, pero lo pongo aquí para simplificar
const EstadoBadge = ({ estado }) => {
  let classes = 'px-2 py-1 text-xs font-medium rounded-full';
  
  if (estado === 'Entregado') {
    classes += ' bg-blue-200 b3 py-1 px-2 rounded-4xl text-blue-700';
  } else if (estado === 'Pendiente') {
    classes += ' bg-yellow-200 b3 py-1 px-2 rounded-4xl text-blue-700';
  } else if (estado === 'Cancelado') {
    classes += ' bg-red-100 text-red-800';
  } else if (estado === 'Pago Completado') {
    classes+= ' bg-green-200 b3 py-1 px-2 rounded-4xl text-green-500'
  }
  else {
    classes += ' bg-gray-100 text-gray-800';
  }

  return <span className={classes}>{estado}</span>;
};


function ResumenVentasRecientes({ orders }) {
  // 1. Obtenemos solo los 5 pedidos más recientes
  // (Asumiendo que ya vienen ordenados por fecha desde el hook)
  const pedidosRecientes = orders.slice(0, 5);
  

  return (
    // 2. Esta es la "tarjeta" contenedora del widget
    <div className="bg-white rounded-lg max-h-full ">
      
      

      {/* 4. La lista de pedidos */}
      <ul className="divide-y divide-gray-200">
        {pedidosRecientes.length > 0 ? (
          pedidosRecientes.map((order) => (
            // 5. Esta es la fila de cada pedido (simplificada)
            <li key={order._id} className="py-4 flex justify-between items-center">
              
              {/* Sección Izquierda: Cliente y Fecha */}
              <div>
                <p className="font-dm-sans font-semibold text-gray-700">
                  {order.clienteNombre}
                </p>
                <p className="font-dm-sans text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                {order.items.map((item) => (

                  <p className='font-dm-sans text-sm text-gray-500'>
                  {item.nombre} x{item.cantidad}
                </p>
                ))}
              </div>

             

              {/* Sección Derecha: Total y Estado */}
              <div className="text-right">
                <p className="font-dm-sans text-sm font-semibold text-gray-600">
                  ${order.total.toFixed(2)}
                </p>
                <EstadoBadge estado={order.estado} />
              </div>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">No hay ventas recientes.</p>
        )}
      </ul>

      
    </div>
  );
}

export default ResumenVentasRecientes;