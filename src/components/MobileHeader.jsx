import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function MobileHeader( {logout} ) {
  const { user } = useContext(AuthContext);

  return (
    // md:hidden significa: "ocúltame en pantallas medianas o más grandes"
    <div className="bg-surface-card border-b border-surface-border p-5 pt-6 pb-6 shadow-sm md:hidden sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div>
           {/* Saludo dinámico */}
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Bienvenido, {user?.nombre || 'Ildefonso'}</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Panel de Control</p>
        </div>
       
        <button 
          className="py-2 px-4 bg-surface-bg border border-surface-border rounded-button text-slate-700 font-bold hover:bg-surface-border hover:text-slate-900 transition-colors shadow-sm text-sm" 
          onClick={logout}
        >
          Salir
        </button>
      </div>
    </div>
  );
}