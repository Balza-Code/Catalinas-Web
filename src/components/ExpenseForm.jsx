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
      
      showModal({ title: 'Éxito', message: 'Gasto registrado correctamente.' });
      
      refreshStats();

      setFormData({
        monto: '',
        moneda: 'Bs',
        tasaCambio: '',
        metodoPago: 'Efectivo USD',
        categoria: 'Materia Prima',
        descripcion: ''
      });

      if (onExpenseCreated) {
        onExpenseCreated();
      }

    } catch (error) {
      console.error(error);
      showModal({ title: 'Error', message: error.message || 'Hubo un error al registrar el gasto.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 max-w-md mx-auto w-full">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">Registrar Nuevo Gasto</h2>
        <button 
          onClick={handleOpenHistory}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
        >
          Historial
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          type="button" 
          onClick={handleNominaPapa}
          className="flex-1 bg-slate-900 text-white text-xs font-semibold py-2 rounded shadow hover:bg-slate-800 transition-colors"
        >
          Nómina Papá ($40)
        </button>
        <button 
          type="button" 
          onClick={handleNominaMia}
          className="flex-1 bg-slate-900 text-white text-xs font-semibold py-2 rounded shadow hover:bg-slate-800 transition-colors"
        >
          Mi Nómina ($20)
        </button>
      </div>
      
      <div className="mb-6 grid grid-cols-3 gap-2">
         <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-200">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Físico USD</p>
           <p className="font-bold text-slate-800 text-base">${Number(stats.caja?.efectivoUSD || 0).toFixed(2)}</p>
         </div>
         <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-200">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Físico Bs</p>
           <p className="font-bold text-slate-800 text-base">${Number(stats.caja?.efectivoBs || 0).toFixed(2)}</p>
         </div>
         <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-200">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Digital</p>
           <p className="font-bold text-slate-800 text-base">${Number(stats.caja?.digital || 0).toFixed(2)}</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Ej. 150.50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
          <select
            name="moneda"
            value={formData.moneda}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Bs">Bolívares (Bs)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>

        {formData.moneda === 'Bs' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Cambio (Bs por USD) *</label>
            <input
              type="number"
              name="tasaCambio"
              value={formData.tasaCambio}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Ej. 36.5"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Caja (Forma de Pago) *</label>
          <select
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Efectivo USD">Efectivo ($ Físico)</option>
            <option value="Efectivo Bs">Efectivo (Bs Físico)</option>
            <option value="Digital">Digital (Banco)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Materia Prima">Materia Prima</option>
            <option value="Servicios">Servicios</option>
            <option value="Personal">Personal</option>
            <option value="Empaque">Empaque</option>
            <option value="Varios">Varios</option>
          </select>
          
          <div className={`mt-2 p-2 rounded-md ${activeLimit.bg} border border-dashed flex justify-between items-center bg-opacity-50`}>
             <span className="text-xs text-slate-600 font-medium">Tope de {activeLimit.label}:</span>
             <span className={`text-sm font-bold ${activeLimit.color}`}>${Number(activeLimit.value || 0).toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Detalles del gasto (Opcional)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center mt-2 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Registrar Gasto'}
        </button>
      </form>
    </div>
  );
}
