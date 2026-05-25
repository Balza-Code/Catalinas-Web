import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import BoardIcon from '../components/icons/BoardIcon';
import AddIcon from '../components/icons/AddIcon';
import HistoryIcon from '../components/icons/HistoryIcon';
import {
  getBatches,
  getRecipes,
  startBatch,
  closeBatch,
  cancelBatch,
} from '../services/productionService';

// ─── Utilidad: formatear fecha ────────────────────────────────────────────────
const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Toast interno (lógica de estado + clases Tailwind puras) ─────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2
        px-5 py-3 rounded-button shadow-xl font-semibold text-sm text-white
        ${type === 'error' ? 'bg-status-danger' : 'bg-status-success'}`}
    >
      <span>{type === 'error' ? '✕' : '✓'}</span>
      {msg}
    </div>
  );
}

// ─── Card de Tanda Activa ─────────────────────────────────────────────────────
function BatchCard({ batch, onFinalize, onCancel }) {
  const receta = batch.recetaId;
  const producto = receta?.productoAsociado;

  return (
    <div className="bg-brand-50/50 border border-brand-100 rounded-card p-5 flex flex-col gap-3 shadow-sm">
      {/* Encabezado */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-bold text-brand-900 text-base">🍞 {receta?.nombre || 'Receta'}</p>
          {producto && (
            <p className="text-xs text-stone-500 mt-0.5">
              Producto: {producto.nombre} · Stock actual:{' '}
              <span className="font-bold">{producto.stock ?? 0}</span> paq.
            </p>
          )}
        </div>
        <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-button whitespace-nowrap">
          EN PROCESO
        </span>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 gap-1 text-sm text-stone-600">
        <span>
          📦 Esperados: <span className="font-bold">{batch.cantidadEsperada} paq.</span>
        </span>
        {batch.costoTotalTanda > 0 && (
          <span>
            💰 Costo: <span className="font-bold">${batch.costoTotalTanda.toFixed(2)}</span>
          </span>
        )}
        <span className="flex items-center gap-1 col-span-2 text-xs text-stone-400">
          <HistoryIcon size={14} /> {formatDate(batch.createdAt)}
        </span>
      </div>

      {batch.notas && (
        <p className="text-xs text-stone-500 italic">📝 {batch.notas}</p>
      )}

      {/* Acciones */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onFinalize(batch)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white font-bold rounded-button text-sm hover:bg-brand-600 transition-colors"
        >
          🔥 Finalizar Horneado
        </button>
        <button
          onClick={() => onCancel(batch._id)}
          className="px-4 py-2.5 bg-surface-card text-slate-500 border border-surface-border font-semibold rounded-button text-sm hover:bg-surface-bg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Card de Historial ────────────────────────────────────────────────────────
function HistoryCard({ batch }) {
  const receta = batch.recetaId;
  const isCompleted = batch.estado === 'Completada';
  const produced = Number(batch.cantidadRealObtenida) || 0;
  const expected = Number(batch.cantidadEsperada) || 0;
  const diff = produced - expected;
  const trendLabel = diff > 0
    ? `📈 Excedente: +${diff} paq.`
    : diff < 0
      ? `📉 Merma: ${diff} paq.`
      : '✅ Meta cumplida';
  const trendClass = diff > 0 ? 'text-status-success' : diff < 0 ? 'text-status-danger' : 'text-slate-700';
  const product = receta?.productoAsociado || receta;
  const precio = Number(product?.precio) || 0;
  const costo = Number(product?.costoProduccion) || 0;
  const marginReal = (precio - costo) * produced;

  return (
    <div
      className={`bg-surface-card border rounded-card p-4 flex flex-col gap-3 shadow-sm
        ${isCompleted ? 'border-status-success/30' : 'border-status-danger/30'}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-semibold text-slate-700 text-sm">{receta?.nombre || 'Receta eliminada'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(batch.updatedAt)}</p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-button ${isCompleted ? 'bg-status-success/20 text-status-success' : 'bg-status-danger/20 text-status-danger'}`}
        >
          {batch.estado.toUpperCase()}
        </span>
      </div>
      {isCompleted && (
        <div className="text-sm text-slate-700">
          <p className="font-semibold">{produced} paq. producidos <span className="font-normal text-slate-500">(Meta: {expected})</span></p>
          <p className={`text-xs font-semibold ${trendClass}`}>{trendLabel}</p>
          <p className="text-xs text-slate-500">Margen Real: {formatCurrency(marginReal)}</p>
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ProductionPanel() {
  const [batches, setBatches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { msg, type }
  const [showHistory, setShowHistory] = useState(false);

  // Modal: Iniciar Tanda
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [expectedQty, setExpectedQty] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [startLoading, setStartLoading] = useState(false);

  // Modal: Finalizar Tanda
  const [closingBatch, setClosingBatch] = useState(null);
  const [realQty, setRealQty] = useState('');
  const [closeLoading, setCloseLoading] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const fetchBatches = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getBatches(token);
      setBatches(data);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecipes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getRecipes(token);
      setRecipes(data);
    } catch (e) {
      console.warn('No se pudieron cargar las recetas:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
    fetchRecipes();
  }, [fetchBatches, fetchRecipes]);

  // Auto-rellenar rendimientoEstimado al seleccionar receta
  useEffect(() => {
    if (!selectedRecipeId) return;
    const receta = recipes.find((r) => r._id === selectedRecipeId);
    if (receta?.rendimientoEstimado) setExpectedQty(String(receta.rendimientoEstimado));
  }, [selectedRecipeId, recipes]);

  // ── Iniciar Tanda ──────────────────────────────────────────────────────────
  const handleStartBatch = async () => {
    if (!selectedRecipeId || !expectedQty) {
      showToast('Selecciona una receta e ingresa la cantidad esperada.', 'error');
      return;
    }
    setStartLoading(true);
    try {
      const token = localStorage.getItem('token');
      const nueva = await startBatch(token, {
        recetaId: selectedRecipeId,
        cantidadEsperada: Number(expectedQty),
        notas: batchNotes,
      });
      setBatches((prev) => [nueva, ...prev]);
      showToast('¡Tanda iniciada! El horno está en marcha 🔥');
      setShowStartModal(false);
      setSelectedRecipeId('');
      setExpectedQty('');
      setBatchNotes('');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setStartLoading(false);
    }
  };

  // ── Cerrar Tanda ───────────────────────────────────────────────────────────
  const handleCloseBatch = async () => {
    if (realQty === '' || Number(realQty) < 0) {
      showToast('Ingresa una cantidad real válida.', 'error');
      return;
    }
    setCloseLoading(true);
    try {
      const token = localStorage.getItem('token');
      const result = await closeBatch(token, closingBatch._id, Number(realQty));
      setBatches((prev) =>
        prev.map((b) => (b._id === closingBatch._id ? result.tanda : b))
      );
      const nombre = result.stockActualizado?.nombre || 'el producto';
      const nuevoStock = result.stockActualizado?.stock ?? '?';
      showToast(`✅ ¡Inventario actualizado! ${nombre} ahora tiene ${nuevoStock} paquetes.`);
      setClosingBatch(null);
      setRealQty('');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setCloseLoading(false);
    }
  };

  // ── Cancelar Tanda ─────────────────────────────────────────────────────────
  const handleCancelBatch = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta tanda?')) return;
    try {
      const token = localStorage.getItem('token');
      await cancelBatch(token, id);
      setBatches((prev) =>
        prev.map((b) => (b._id === id ? { ...b, estado: 'Cancelada' } : b))
      );
      showToast('Tanda cancelada.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Derivados ──────────────────────────────────────────────────────────────
  const activeBatches = batches.filter((b) => b.estado === 'En Proceso');
  const historyBatches = batches.filter((b) => b.estado !== 'En Proceso');
  const normalisedRecipeId = String(selectedRecipeId || '');
  const selectedReceta = recipes.find(
    (r) => String(r._id) === normalisedRecipeId || String(r.id) === normalisedRecipeId,
  );
  const productData = selectedReceta?.productoAsociado || selectedReceta;
  const expectedQtyNumber = Number(expectedQty) || 0;
  const precioVenta = Number(productData?.precio ?? productData?.precioVenta ?? 0) || 0;
  const costoProduccion = Number(productData?.costoProduccion ?? productData?.costProduction ?? 0) || 0;
  const inversionEstimada = costoProduccion * expectedQtyNumber;
  const potencialVenta = precioVenta * expectedQtyNumber;
  const margenEstimado = potencialVenta - inversionEstimada;
  const showProjection = Boolean(selectedReceta && expectedQtyNumber > 0);

  const activeBatchMetrics = activeBatches.map((batch) => {
    const recipe = batch?.recetaId;
    const product = recipe?.productoAsociado || recipe;
    const precio = Number(product?.precio ?? 0) || 0;
    const costo = Number(product?.costoProduccion ?? 0) || 0;
    const cantidad = Number(batch?.cantidadEsperada) || 0;
    const potential = precio * cantidad;
    const margin = (precio - costo) * cantidad;
    return { potential, margin, cantidad };
  });
  const valorEnHorno = activeBatchMetrics.reduce((sum, item) => sum + item.potential, 0);
  const proyeccionMargenTotal = activeBatchMetrics.reduce((sum, item) => sum + item.margin, 0);
  const paqEnProceso = activeBatchMetrics.reduce((sum, item) => sum + item.cantidad, 0);

  const closingExpectedQty = Number(closingBatch?.cantidadEsperada) || 0;
  const closingRealQty = Number(realQty) || 0;
  const closingDiff = closingRealQty - closingExpectedQty;
  const closingPerformanceLabel = closingDiff > 0
    ? `📈 Excedente: +${Math.abs(closingDiff)} paq.`
    : closingDiff < 0
      ? `📉 Merma: -${Math.abs(closingDiff)} paq.`
      : '✅ Meta cumplida';
  const closingPerformanceClass = closingDiff > 0 ? 'text-emerald-600' : closingDiff < 0 ? 'text-rose-600' : 'text-slate-700';
  const closingProduct = closingBatch?.recetaId?.productoAsociado || closingBatch?.recetaId;
  const closingPrice = Number(closingProduct?.precio ?? 0) || 0;
  const closingCost = Number(closingProduct?.costoProduccion ?? 0) || 0;
  const closingMarginReal = (closingPrice - closingCost) * closingRealQty;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-surface-bg px-4 py-6 pb-24 font-[Inter] max-w-4xl mx-auto">

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">🏭 Control de Producción</h1>
          <p className="text-sm text-stone-500 mt-1">
            Registra cada horneado y actualiza el inventario automáticamente
          </p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand-500 text-white font-bold rounded-button shadow hover:bg-brand-600 hover:-translate-y-0.5 transition-all text-sm"
        >
          <AddIcon size={20} />
          Iniciar Nueva Tanda
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <div className="rounded-card bg-surface-card p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Valor en Horno</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{formatCurrency(valorEnHorno)}</p>
          <p className="mt-2 text-sm text-slate-500">Potencial de venta total de las tandas en proceso</p>
        </div>
        <div className="rounded-card bg-surface-card p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Proyección del Día</p>
          <p className="mt-4 text-3xl font-semibold text-status-success">{formatCurrency(proyeccionMargenTotal)}</p>
          <p className="mt-2 text-sm text-slate-500">Margen estimado total de las tandas activas</p>
        </div>
        <div className="rounded-card bg-surface-card p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Paquetes en Proceso</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{paqEnProceso}</p>
          <p className="mt-2 text-sm text-slate-500">Cantidad total planificada para hornear</p>
        </div>
      </div>

      {/* Tandas Activas */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-brand-900 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100 inline-block" />
          Tandas En Proceso ({activeBatches.length})
        </h2>

        {loading ? (
          <p className="text-center text-slate-400 py-10">Cargando tandas…</p>
        ) : activeBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-surface-border rounded-card text-stone-400 bg-surface-card shadow-sm">
            <BoardIcon size={36} className="opacity-40" />
            <p className="font-semibold">No hay tandas en proceso</p>
            <p className="text-xs">Inicia una nueva tanda para comenzar a registrar producción.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeBatches.map((b) => (
              <BatchCard
                key={b._id}
                batch={b}
                onFinalize={(batch) => {
                  setClosingBatch(batch);
                  setRealQty(String(batch.cantidadEsperada));
                }}
                onCancel={handleCancelBatch}
              />
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {historyBatches.length > 0 && (
        <section className="mt-10">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 mb-3 transition-colors"
          >
            {showHistory ? '▾' : '▸'} Historial ({historyBatches.length} tandas)
          </button>
          {showHistory && (
            <div className="flex flex-col gap-3">
              {historyBatches.map((b) => (
                <HistoryCard key={b._id} batch={b} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal: Iniciar Tanda */}
      {showStartModal && (
        <Modal title="🍞 Iniciar Nueva Tanda" onClose={() => setShowStartModal(false)}>
          <div className="flex flex-col gap-4">
            {/* Selector de Receta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Receta a preparar *</label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-border rounded-button bg-surface-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">— Selecciona una receta —</option>
                {recipes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.nombre} ({r.rendimientoEstimado} paq. estimados)
                  </option>
                ))}
              </select>
            </div>

            {/* Preview de stock actual si hay producto asociado */}
            {selectedReceta?.productoAsociado && (
              <div className="bg-status-success/10 border border-status-success/20 rounded-button px-4 py-2.5 text-xs text-status-success font-semibold">
                📦 Producto: <span className="font-bold">{selectedReceta.productoAsociado.nombre}</span>
                {' — '}Stock actual:{' '}
                <span className="font-bold">{selectedReceta.productoAsociado.stock ?? 0}</span> paq.
              </div>
            )}

            {/* Paquetes esperados */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Paquetes esperados *</label>
              <input
                type="number"
                min="1"
                value={expectedQty}
                onChange={(e) => setExpectedQty(e.target.value)}
                placeholder="Ej: 28"
                className="w-full px-3 py-2.5 border border-surface-border rounded-button bg-surface-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="bg-surface-bg border border-surface-border p-4 rounded-card mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Proyección de Producción</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-button bg-surface-card p-3 border border-surface-border">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Costo Total</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{formatCurrency(showProjection ? inversionEstimada : 0)}</p>
                  <p className="mt-2 text-xs text-slate-500">{showProjection ? 'Costo de producción estimado' : 'Ingresa la cantidad para proyectar'}</p>
                </div>
                <div className="rounded-button bg-surface-card p-3 border border-surface-border">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Potencial de Venta</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{formatCurrency(showProjection ? potencialVenta : 0)}</p>
                  <p className="mt-2 text-xs text-slate-500">Ingresos brutos estimados</p>
                </div>
                <div className="rounded-button bg-surface-card p-3 border border-surface-border">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Ganancia Esperada</p>
                  <p className="mt-3 text-xl font-semibold text-status-success">{formatCurrency(showProjection ? margenEstimado : 0)}</p>
                  <p className="mt-2 text-xs text-slate-500">Margen estimado antes de hornear</p>
                </div>
              </div>
            </div>

            {/* Notas opcionales */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Notas (opcional)</label>
              <textarea
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                rows={2}
                placeholder="Ej: Masa especial, horno a 180°C…"
                className="w-full px-3 py-2.5 border border-surface-border rounded-button bg-surface-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 py-2.5 bg-surface-bg text-slate-600 font-semibold rounded-button hover:bg-surface-border transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartBatch}
                disabled={startLoading}
                className="flex-[2] py-2.5 bg-brand-500 text-white font-bold rounded-button hover:bg-brand-600 transition-all text-sm disabled:opacity-60"
              >
                {startLoading ? 'Iniciando…' : '🔥 Iniciar Tanda'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Finalizar Tanda */}
      {closingBatch && (
        <Modal title="✅ Finalizar Horneado" onClose={() => setClosingBatch(null)}>
          <div className="flex flex-col gap-4">
            {/* Info de la tanda */}
            <div className="bg-brand-50 border border-brand-100 rounded-card px-4 py-3 text-sm text-brand-900">
              <p className="font-bold">🍞 {closingBatch.recetaId?.nombre}</p>
              <p className="mt-1">
                Paquetes esperados: <span className="font-bold">{closingBatch.cantidadEsperada}</span>
              </p>
            </div>

            {/* Input cantidad real */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800">
                ¿Cuántos paquetes salieron realmente del horno?
              </label>
              <input
                type="number"
                min="0"
                value={realQty}
                onChange={(e) => setRealQty(e.target.value)}
                autoFocus
                className="w-full px-4 py-4 border-2 border-brand-500 rounded-card text-3xl font-bold text-center text-slate-800 bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="text-xs text-slate-400 text-center">
                Este valor se sumará al stock de inventario del producto asociado.
              </p>
            </div>

            <div className="rounded-card bg-surface-bg border border-surface-border p-4">
              <p className="text-sm font-semibold text-slate-700">Rendimiento vs Meta</p>
              <p className={`mt-2 text-base font-semibold ${closingPerformanceClass}`}>{closingPerformanceLabel}</p>
              <p className="mt-1 text-xs text-slate-500">Margen real estimado: {formatCurrency(closingMarginReal)}</p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setClosingBatch(null)}
                className="flex-1 py-2.5 bg-surface-bg text-slate-600 font-semibold rounded-button hover:bg-surface-border transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseBatch}
                disabled={closeLoading}
                className="flex-[2] py-3 bg-brand-500 text-white font-bold rounded-button hover:bg-brand-600 transition-all text-sm disabled:opacity-60"
              >
                {closeLoading ? 'Guardando…' : '✅ Confirmar y Actualizar Inventario'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
