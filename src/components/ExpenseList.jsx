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
    <div className="space-y-3 max-h-[60vh] overflow-y-auto w-full min-w-[320px] md:min-w-[400px] bg-surface-bg p-4 rounded-card border border-surface-border shadow-inner">
      {expenses.length === 0 ? (
        <p className="text-center text-slate-500 font-semibold py-8 bg-surface-card rounded-card border border-dashed border-surface-border">No hay gastos registrados aún.</p>
      ) : (
        expenses.map(gasto => (
          <div key={gasto._id} className="border border-surface-border rounded-card p-4 bg-surface-card flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="font-black text-slate-800 text-lg flex items-center">
                ${Number(gasto.montoCalculadoUSD).toFixed(2)} 
                <span className="text-[10px] font-bold text-slate-600 bg-surface-bg border border-surface-border px-2 py-0.5 rounded-button ml-2 uppercase tracking-wide">
                  {gasto.categoria}
                </span>
              </p>
              <p className="text-sm font-medium text-slate-500 truncate max-w-[200px] mt-1">{gasto.descripcion || 'Sin descripción'}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                {new Date(gasto.createdAt).toLocaleDateString()} • {gasto.metodoPago} {gasto.moneda === 'Bs' && `(Tasa: ${gasto.tasaCambio})`}
              </p>
            </div>
            <button 
              onClick={() => handleDelete(gasto._id)}
              className="text-status-danger bg-status-danger/10 border border-status-danger/20 hover:bg-status-danger/20 px-3 py-2 rounded-button transition-colors text-xs font-bold"
            >
              Revertir
            </button>
          </div>
        ))
      )}
    </div>
  );
}
