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

// ─── Toast interno (lógica de estado + clases Tailwind puras) ─────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2
        px-5 py-3 rounded-xl shadow-xl font-semibold text-sm text-white
        ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
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
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 rounded-2xl p-5 flex flex-col gap-3 shadow-md">
      {/* Encabezado */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-bold text-amber-900 text-base">🍞 {receta?.nombre || 'Receta'}</p>
          {producto && (
            <p className="text-xs text-stone-500 mt-0.5">
              Producto: {producto.nombre} · Stock actual:{' '}
              <span className="font-bold">{producto.stock ?? 0}</span> paq.
            </p>
          )}
        </div>
        <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-bold rounded-xl text-sm hover:brightness-110 transition-all"
        >
          🔥 Finalizar Horneado
        </button>
        <button
          onClick={() => onCancel(batch._id)}
          className="px-4 py-2.5 bg-white text-slate-500 border border-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
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

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex justify-between items-center
        ${isCompleted ? 'border-green-200' : 'border-red-200'}`}
    >
      <div>
        <p className="font-semibold text-slate-700 text-sm">{receta?.nombre || 'Receta eliminada'}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(batch.updatedAt)}</p>
      </div>
      <div className="text-right">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full
            ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
        >
          {batch.estado.toUpperCase()}
        </span>
        {isCompleted && (
          <p className="text-xs text-slate-500 mt-1">{batch.cantidadRealObtenida} paq. producidos</p>
        )}
      </div>
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
  const selectedReceta = recipes.find((r) => r._id === selectedRecipeId);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#f5f0e6] px-4 py-6 pb-24 font-[Inter] max-w-4xl mx-auto">

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
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all text-sm"
        >
          <AddIcon size={20} />
          Iniciar Nueva Tanda
        </button>
      </div>

      {/* Tandas Activas */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-100 inline-block" />
          Tandas En Proceso ({activeBatches.length})
        </h2>

        {loading ? (
          <p className="text-center text-slate-400 py-10">Cargando tandas…</p>
        ) : activeBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-stone-300 rounded-2xl text-stone-400">
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
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-700">
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
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Notas opcionales */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Notas (opcional)</label>
              <textarea
                value={batchNotes}
                onChange={(e) => setBatchNotes(e.target.value)}
                rows={2}
                placeholder="Ej: Masa especial, horno a 180°C…"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartBatch}
                disabled={startLoading}
                className="flex-[2] py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold rounded-xl hover:brightness-110 transition-all text-sm disabled:opacity-60"
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
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
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
                className="w-full px-4 py-4 border-2 border-amber-400 rounded-2xl text-3xl font-bold text-center text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-slate-400 text-center">
                Este valor se sumará al stock de inventario del producto asociado.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setClosingBatch(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseBatch}
                disabled={closeLoading}
                className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl hover:brightness-110 transition-all text-sm disabled:opacity-60"
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
