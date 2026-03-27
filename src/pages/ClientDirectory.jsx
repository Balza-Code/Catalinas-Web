import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useAdmin } from '../hooks/useAdmin';

const ClientDirectory = () => {
  const { user } = useContext(AuthContext);
  const { clientes, loading, error } = useAdmin(user?.token);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Directorio de Clientes</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <div key={cliente.userId} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{cliente.nombre}</h3>
              <p className="text-sm text-gray-600 mb-2">Email: {cliente.email}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total de Pedidos:</span>
                  <span className="text-sm">{cliente.totalPedidos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Comprado:</span>
                  <span className="text-sm">${cliente.montoTotalGastado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Deuda Pendiente:</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      cliente.saldoDeudor > 0
                        ? 'text-red-600 bg-red-50'
                        : 'text-green-600 bg-green-50'
                    }`}
                  >
                    ${cliente.saldoDeudor.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;