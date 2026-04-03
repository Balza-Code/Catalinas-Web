import React, { useEffect, useState } from 'react';
import { getExpenses, deleteExpense } from '../services/expenseService';

export default function ExpenseList({ onExpenseDeleted }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de revertir este gasto? El saldo será restaurado en tu caja de forma automática.")) return;
    
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e._id !== id));
      if (onExpenseDeleted) onExpenseDeleted({ deleted: true }); // Envía trigger para recargar topes
    } catch (err) {
      alert("Error al revertir: " + err.message);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Cargando historial de gastos...</div>;
  if (error) return <div className="p-6 text-center text-rose-500">{error}</div>;

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto w-full min-w-[320px] md:min-w-[400px] bg-slate-50 p-4 rounded-xl">
      {expenses.length === 0 ? (
        <p className="text-center text-slate-500 py-4">No hay gastos registrados aún.</p>
      ) : (
        expenses.map(gasto => (
          <div key={gasto._id} className="border border-slate-200 rounded-xl p-4 bg-white flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-slate-800 text-lg">
                ${Number(gasto.montoCalculadoUSD).toFixed(2)} 
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full ml-2 align-middle">
                  {gasto.categoria}
                </span>
              </p>
              <p className="text-sm text-slate-500 truncate max-w-[200px] mt-1">{gasto.descripcion || 'Sin descripción'}</p>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                {new Date(gasto.createdAt).toLocaleDateString()} • {gasto.metodoPago} {gasto.moneda === 'Bs' && `(Tasa: ${gasto.tasaCambio})`}
              </p>
            </div>
            <button 
              onClick={() => handleDelete(gasto._id)}
              className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              Revertir
            </button>
          </div>
        ))
      )}
    </div>
  );
}
