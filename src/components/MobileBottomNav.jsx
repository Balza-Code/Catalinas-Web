import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import BoardIcon from './icons/BoardIcon';
import AddIcon from './icons/AddIcon';
import SalesIcon from './icons/SalesIcon';
import HistoryIcon from './icons/HistoryIcon';

export function MobileBottomNav() {
  const { pathname } = useLocation();

  // Choose items depending on whether we're in /admin or /cliente
  const isClient = pathname.startsWith('/cliente');

  const adminItems = [
    { id: 'Dashboard', icon: BoardIcon, path: '/admin' },
    { id: 'Venta', icon: SalesIcon, path: '/admin/ventas-detal' },
    { id: 'Productos', icon: AddIcon, path: '/admin/productos' },
    { id: 'Pedidos', icon: HistoryIcon, path: '/admin/historial' },
  ];

  const clientItems = [
    { id: 'Pedido', icon: SalesIcon, path: '/cliente' },
    { id: 'Historial', icon: HistoryIcon, path: '/cliente/historial' },
  ];

  const navItems = isClient ? clientItems : adminItems;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white z-50 md:hidden">
      <div className="flex justify-between items-center h-24 ">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin' || item.path === '/cliente'}
              className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors gap-1 ${isActive ? '' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ color: isActive ? 'var(--primary-500)' : '#9CA3AF' }} size={28} />
                  <span className="b3 text-gray-400" style={{ color: isActive ? 'var(--primary-500)' : undefined }}>{item.id}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}