import React, { useState } from 'react';
import { createExpense } from '../services/expenseService';
import { useModal } from '../context/ModalContext';
import { useFinancialStats } from '../hooks/useFinancialStats';
import ExpenseList from './ExpenseList';

export default function ExpenseForm({ onExpenseCreated }) {
  const { showModal } = useModal();
  const token = localStorage.getItem('token');
  const { stats, refresh: refreshStats } = useFinancialStats(token, 'semana');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monto: '',
    moneda: 'Bs',
    tasaCambio: '',
    metodoPago: 'Efectivo USD',
    categoria: 'Materia Prima',
    descripcion: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMetodoSelect = (method) => {
    // Sync moneda depending on selected caja
    const moneda = method === 'Efectivo Bs' ? 'Bs' : 'USD';
    setFormData((prev) => ({ ...prev, metodoPago: method, moneda, tasaCambio: moneda === 'Bs' ? prev.tasaCambio : '' }));
  };

  const quickConcepts = [
    { key: 'nomina', label: 'Nómina' },
    { key: 'transporte', label: 'Transporte' },
    { key: 'material', label: 'Material' },
    { key: 'servicios', label: 'Servicios' },
  ];

  const applyQuickConcept = (label) => {
    setFormData((prev) => ({ ...prev, descripcion: label }));
  };

  const handleOpenHistory = () => {
    showModal({
      title: 'Historial de Egresos',
      children: <ExpenseList onExpenseDeleted={refreshStats} />
    });
  };

  const handleNominaPapa = () => {
    setFormData({
      monto: 40,
      moneda: 'USD',
      tasaCambio: '',
      metodoPago: 'Efectivo USD',
      categoria: 'Personal',
      descripcion: 'Nómina Papá'
    });
  };

  const handleNominaMia = () => {
    setFormData({
      monto: 20,
      moneda: 'USD',
      tasaCambio: '',
      metodoPago: 'Efectivo USD',
      categoria: 'Personal',
      descripcion: 'Nómina Sneyd'
    });
  };

  const activeLimit = (() => {
    if (['Materia Prima', 'Empaque'].includes(formData.categoria)) {
      return { label: 'Capital a Reinvertir', value: stats.capitalReinversion, color: 'text-amber-600', bg: 'bg-amber-50' };
    }
    return { label: 'Ganancia Neta', value: stats.gananciaNeta, color: 'text-emerald-600', bg: 'bg-emerald-50' };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar monto y tasa
      const payload = {
        ...formData,
        monto: Number(formData.monto),
        tasaCambio: formData.moneda === 'Bs' ? Number(formData.tasaCambio) : 1
      };

      if (isNaN(payload.monto) || payload.monto <= 0) {
        showModal({ title: 'Error', message: 'El monto debe ser un número válido mayor a 0.' });
        setLoading(false);
        return;
      }

      if (formData.moneda === 'Bs' && (isNaN(payload.tasaCambio) || payload.tasaCambio <= 0)) {
        showModal({ title: 'Error', message: 'La tasa de cambio debe ser un número mayor a 0.' });
        setLoading(false);
        return;
      }

      await createExpense(payload);

      if (onExpenseCreated) {
        onExpenseCreated();
      } else {
        showModal({ title: 'Éxito', message: 'Gasto registrado correctamente.' });
      }
      
      refreshStats();

      setFormData({
        monto: '',
        moneda: 'Bs',
        tasaCambio: '',
        metodoPago: 'Efectivo USD',
        categoria: 'Materia Prima',
        descripcion: ''
      });

    } catch (error) {
      console.error(error);
      showModal({ title: 'Error', message: error.message || 'Hubo un error al registrar el gasto.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-card p-8 rounded-card border border-surface-border shadow-lg max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-6 border-b border-surface-border pb-3">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Registrar Nuevo Gasto</h2>
        <button 
          onClick={handleOpenHistory}
          className="text-sm font-bold text-brand-600 hover:text-brand-800 hover:underline transition-colors bg-brand-50 px-3 py-1 rounded-button"
        >
          Historial
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <button 
          type="button" 
          onClick={handleNominaPapa}
          className="flex-1 bg-surface-bg border border-surface-border text-slate-700 text-xs font-bold py-2.5 rounded-button shadow-sm hover:bg-surface-border transition-colors"
        >
          Nómina Papá ($40)
        </button>
        <button 
          type="button" 
          onClick={handleNominaMia}
          className="flex-1 bg-surface-bg border border-surface-border text-slate-700 text-xs font-bold py-2.5 rounded-button shadow-sm hover:bg-surface-border transition-colors"
        >
          Mi Nómina ($20)
        </button>
      </div>
      
      <div className="mb-6 grid grid-cols-3 gap-3">
         <div className="bg-surface-bg p-3 rounded-card text-center border border-surface-border shadow-sm">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Físico USD</p>
           <p className="font-black text-slate-800 text-lg">${Number(stats.caja?.efectivoUSD || 0).toFixed(2)}</p>
         </div>
         <div className="bg-surface-bg p-3 rounded-card text-center border border-surface-border shadow-sm">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Físico Bs</p>
           <p className="font-black text-slate-800 text-lg">${Number(stats.caja?.efectivoBs || 0).toFixed(2)}</p>
         </div>
         <div className="bg-surface-bg p-3 rounded-card text-center border border-surface-border shadow-sm">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Digital</p>
           <p className="font-black text-slate-800 text-lg">${Number(stats.caja?.digital || 0).toFixed(2)}</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Monto *</label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full bg-surface-bg border border-surface-border rounded-button p-4 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-4xl text-center font-black shadow-inner"
            placeholder="0.00"
          />
        </div>

        {/* Selector visual de origen de fondos (radio cards) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Cuenta / Caja *</label>
          <div role="radiogroup" aria-label="Origen de fondos" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'Efectivo USD', label: '💵 Efectivo USD' },
              { key: 'Efectivo Bs', label: '🇻🇪 Efectivo Bs' },
              { key: 'Digital', label: '💳 Digital / Banco' },
            ].map((opt) => {
              const active = formData.metodoPago === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleMetodoSelect(opt.key)}
                  className={`w-full text-left p-3 rounded-card border transition-all flex flex-col justify-between min-h-[90px] ${active ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500' : 'border-surface-border bg-surface-bg hover:border-brand-300 hover:bg-surface-border hover:shadow-sm'} focus:outline-none`}
                >
                  <span className="text-2xl mb-1">{opt.label.split(' ')[0]}</span>
                  <div>
                    <div className="font-bold text-xs text-slate-800 leading-tight">{opt.label.split(' ').slice(1).join(' ')}</div>
                    {active && <div className="text-brand-700 font-bold text-[10px] mt-1">Seleccionado</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasa dinamica: aparece si se selecciona Efectivo Bs */}
        {formData.metodoPago === 'Efectivo Bs' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tasa de Cambio (Bs por USD) *</label>
            <input
              type="number"
              name="tasaCambio"
              value={formData.tasaCambio}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full bg-surface-bg border border-surface-border rounded-button p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="Ej. 36.5"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría *</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className="w-full bg-surface-bg border border-surface-border rounded-button p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 appearance-none font-medium"
          >
            <option value="Materia Prima">Materia Prima</option>
            <option value="Servicios">Servicios</option>
            <option value="Personal">Personal</option>
            <option value="Empaque">Empaque</option>
            <option value="Varios">Varios</option>
          </select>
          
          <div className={`mt-3 p-2.5 rounded-button ${activeLimit.bg} border border-dashed flex justify-between items-center bg-opacity-50`}>
             <span className="text-xs text-slate-600 font-bold">Tope de {activeLimit.label}:</span>
             <span className={`text-sm font-black ${activeLimit.color}`}>${Number(activeLimit.value || 0).toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {quickConcepts.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => applyQuickConcept(c.label)}
                className="text-xs px-3 py-1.5 rounded-button bg-surface-bg border border-surface-border text-slate-700 hover:bg-surface-border focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold transition-colors"
              >
                {c.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full bg-surface-bg border border-surface-border rounded-button p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            placeholder="Detalles del gasto (Opcional)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-button shadow-md transition-all flex justify-center items-center mt-6 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Registrar Gasto Definitivo'}
        </button>
      </form>
    </div>
  );
}
