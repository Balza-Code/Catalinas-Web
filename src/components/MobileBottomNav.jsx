import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import BoardIcon from './icons/BoardIcon';
import AddIcon from './icons/AddIcon';
import HistoryIcon from './icons/HistoryIcon';
import UserIcon from './icons/UserIcon';
import PosIcon from './icons/PosIcon';
import SalesIcon from './icons/SalesIcon';

const MenuIcon = ({ className = '', size = 28, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = ({ className = '', size = 28, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Choose items depending on whether we're in /admin or /cliente
  const isClient = pathname.startsWith('/cliente');

  const adminItems = [
    { id: 'Dashboard', icon: BoardIcon, path: '/admin' },
    { id: 'Venta', icon: PosIcon, path: '/admin/pos' },
    { id: 'Pedidos', icon: HistoryIcon, path: '/admin/historial' },
    { id: 'Más', icon: MenuIcon, isAction: true, action: () => setIsMenuOpen(true) },
  ];

  const clientItems = [
    { id: 'Pedido', icon: SalesIcon, path: '/cliente' },
    { id: 'Historial', icon: HistoryIcon, path: '/cliente/historial' },
  ];

  const navItems = isClient ? clientItems : adminItems;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-surface-card z-50 md:hidden border-t border-surface-border shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsMenuOpen(false)} />
      )}
      
      {/* Drawer Content */}
      <div className={`fixed bottom-24 left-4 right-4 bg-surface-card border border-surface-border rounded-card p-6 shadow-2xl z-50 transform transition-all duration-300 origin-bottom ${isMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 pointer-events-none translate-y-4'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">Menú Administrativo</h3>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-surface-bg rounded-button text-slate-500 hover:bg-surface-border transition-colors">
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <NavLink to="/admin/clientes" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-button transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-sm' : 'bg-surface-bg text-slate-700 hover:bg-surface-border border border-transparent'}`}>
            <UserIcon size={24} className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-500'} />
            <span>Directorio de Clientes</span>
          </NavLink>
          <NavLink to="/admin/productos" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-button transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-sm' : 'bg-surface-bg text-slate-700 hover:bg-surface-border border border-transparent'}`}>
            <AddIcon size={24} />
            <span>Agregar Productos</span>
          </NavLink>
          <NavLink to="/admin/finanzas" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-button transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-sm' : 'bg-surface-bg text-slate-700 hover:bg-surface-border border border-transparent'}`}>
            <BoardIcon size={24} />
            <span>Inteligencia Financiera</span>
          </NavLink>
          <NavLink to="/admin/calculadora" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-button transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-sm' : 'bg-surface-bg text-slate-700 hover:bg-surface-border border border-transparent'}`}>
            <SalesIcon size={24} />
            <span>Calculadora de Recetas</span>
          </NavLink>
          <NavLink to="/admin/produccion" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-button transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-sm' : 'bg-surface-bg text-slate-700 hover:bg-surface-border border border-transparent'}`}>
            <BoardIcon size={24} />
            <span>Control de Producción</span>
          </NavLink>
        </div>
      </div>

      <div className="flex justify-between items-center h-20 px-2 pb-safe pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors gap-1 group`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isMenuOpen ? 'bg-brand-50' : 'group-hover:bg-surface-bg'}`}>
                  <Icon className={isMenuOpen ? 'text-brand-500' : 'text-slate-400'} size={24} />
                </div>
                <span className={`font-['Inter'] transition-colors ${isMenuOpen ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>{item.id}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin' || item.path === '/cliente'}
              className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full text-xs transition-colors gap-1 group`}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-brand-50' : 'group-hover:bg-surface-bg'}`}>
                    <Icon className={isActive ? 'text-brand-500' : 'text-slate-400'} size={24} />
                  </div>
                  <span className={`font-['Inter'] transition-colors ${isActive ? 'text-brand-600 font-bold' : 'text-slate-400 font-medium'}`}>{item.id}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}