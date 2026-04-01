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
        <div className="inline-flex rounded-full bg-white border border-slate-200 p-1 shadow-sm">
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

        <div className="mt-6 space-y-3">
          <div className="overflow-hidden rounded-3xl bg-slate-100 h-4">
            <div className={`h-4 ${progressColor}`} style={{ width: `${progressValue}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{progressValue}% de la meta</span>
            <span>{stats.metaSemanal ? formatCurrency(stats.capitalReinversion) : formatCurrency(0)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div
          onClick={handleOpenSalesDetails}
          role="button"
          tabIndex={0}
          className={`rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition ${loading ? 'animate-pulse' : 'hover:bg-slate-50 cursor-pointer'}`}
        >
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Ventas Totales</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.ingresosTotales)}</p>
          <p className="mt-2 text-sm text-slate-500">Ingresos de pedidos cerrados</p>
        </div>
        <div className={`rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Capital a Reinvertir</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(stats.capitalReinversion)}</p>
          <p className="mt-2 text-sm text-slate-500">Costo de producción recuperado</p>
        </div>
        <div className={`rounded-3xl bg-white p-6 shadow-sm border border-slate-100 ${loading ? 'animate-pulse' : ''}`}>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Ganancia Neta Libre</p>
          <p className={`mt-4 text-3xl font-semibold ${gainColor}`}>{formatCurrency(stats.gananciaNeta)}</p>
          <p className="mt-2 text-sm text-slate-500">Ingresos menos reinversión</p>
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
