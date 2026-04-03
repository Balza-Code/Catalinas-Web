import { useEffect, useMemo, useState } from 'react';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { updateMetaGoal } from '../services/adminService';
import { useModal } from '../context/ModalContext';

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function FinancialDashboard() {
  const [periodo, setPeriodo] = useState('semana');
  const token = localStorage.getItem('token');
  const { stats, loading, error, refresh } = useFinancialStats(token, periodo);
  const { showModal } = useModal();
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [newMetaValue, setNewMetaValue] = useState(50);
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaError, setMetaError] = useState(null);

  useEffect(() => {
    setNewMetaValue(stats.metaSemanal ?? 50);
  }, [stats.metaSemanal]);

  const handleSaveMeta = async () => {
    setMetaError(null);
    setSavingMeta(true);

    try {
      await updateMetaGoal(token, Number(newMetaValue));
      setIsEditingMeta(false);
      refresh();
    } catch (err) {
      setMetaError(err.message || 'No se pudo actualizar la meta');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleOpenSalesDetails = () => {
    const pedidos = Array.isArray(stats.pedidos) ? stats.pedidos : [];
    const totalPedidos = pedidos.reduce((sum, pedido) => sum + (Number(pedido.total) || 0), 0);

    showModal({
      title: 'Desglose de Ventas',
      children: (
        <div className="space-y-4">
          {pedidos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Cliente</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(pedido.fecha).toLocaleDateString('es-VE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{pedido.clienteNombre || 'Cliente anónimo'}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(pedido.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end border-t border-slate-200 pt-3 text-sm font-semibold text-slate-900">
                Total: {formatCurrency(totalPedidos)}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">No hay pedidos para este periodo.</div>
          )}
        </div>
      ),
    });
  };

  const progressValue = useMemo(() => {
    if (!stats.metaSemanal || stats.metaSemanal === 0) return 0;
    return Math.min(100, Math.round((stats.capitalReinversion / stats.metaSemanal) * 100));
  }, [stats.capitalReinversion, stats.metaSemanal]);

  const progressColor = progressValue >= 100 ? 'bg-emerald-500' : 'bg-amber-500';
  const gainColor = stats.gananciaNeta >= 0 ? 'text-emerald-600' : 'text-rose-500';

  return (
    <section className="space-y-6 p-6 bg-slate-50 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Inteligencia Financiera</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Resumen financiero</h2>
        </div>
        <div className="flex overflow-x-auto no-scrollbar rounded-full bg-white border border-slate-200 p-1 shadow-sm w-full sm:w-auto">
          <div className="flex min-w-max">
            <button
              type="button"
              onClick={() => setPeriodo('semana')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${periodo === 'semana' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('mes')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${periodo === 'mes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('30dias')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${periodo === '30dias' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              30 Días
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('90dias')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${periodo === '90dias' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              90 Días
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Meta de reinversión</p>
              <button
                type="button"
                onClick={() => {
                  setNewMetaValue(stats.metaSemanal ?? 50);
                  setMetaError(null);
                  setIsEditingMeta(true);
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Editar
              </button>
            </div>

            {isEditingMeta ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMetaValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewMetaValue(value === '' ? 0 : Number(value));
                  }}
                  className="w-32 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {savingMeta ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(false)}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(stats.metaSemanal)}</p>
            )}

            {metaError && (
              <p className="mt-2 text-sm text-rose-600">{metaError}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Capital reinvertido</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(stats.capitalReinversion)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="overflow-hidden rounded-3xl bg-slate-100 h-4">
            <div className={`h-4 ${progressColor}`} style={{ width: `${progressValue}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
            <span>{progressValue}% de la meta</span>
            <span>{stats.metaSemanal ? formatCurrency(stats.capitalReinversion) : formatCurrency(0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Disponibilidad en Caja (Conciliación)</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Físico USD */}
          <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">💵 Físico USD</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.caja?.efectivoUSD)}</p>
          </div>

          {/* Físico Bs */}
          <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">💸 Físico Bs</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.caja?.efectivoBs)}</p>
          </div>

          {/* Digital / Banco */}
          <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-start">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">📱 Digital / Banco</p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.caja?.digital)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        {/* Ventas Totales */}
        <div
          onClick={handleOpenSalesDetails}
          role="button"
          tabIndex={0}
          className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition ${loading ? 'animate-pulse' : 'hover:bg-slate-50 cursor-pointer'}`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Ventas Totales</p>
            <div className="p-2 bg-blue-50 rounded-2xl text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.ingresosTotales)}</p>
          <p className="mt-2 text-sm text-slate-500">Ingresos de pedidos cerrados</p>
        </div>

        {/* Capital a Reinvertir */}
        <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
           <div className="flex justify-between items-start">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Capital a Reinvertir</p>
            <div className="p-2 bg-amber-50 rounded-2xl text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.capitalReinversion)}</p>
          <p className="mt-2 text-sm text-slate-500">Costo de producción recuperado</p>
        </div>
        
        {/* Ganancia Neta */}
        <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
          <div className="flex justify-between items-start">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Ganancia Neta Libre</p>
            <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
          <p className={`mt-4 text-3xl font-semibold ${gainColor}`}>{formatCurrency(stats.gananciaNeta)}</p>
          <p className="mt-2 text-sm text-slate-500">(Ingresos - Reinversión) - Gastos</p>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}
    </section>
  );
}
