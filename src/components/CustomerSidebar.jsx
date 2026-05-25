import { NavLink } from 'react-router-dom';
import SalesIcon from './icons/SalesIcon';
import HistoryIcon from './icons/HistoryIcon';

export const CustomerSidebar = ({ logout }) => {
  const menuItems = [
    { id: 'Hacer un Pedido', icon: SalesIcon, path: '/cliente' },
    { id: 'Historial de Pedidos', icon: HistoryIcon, path: '/cliente/historial' },
  ];

  return (
    <nav className="sidebar flex flex-col h-full bg-surface-card border-r border-surface-border p-4 gap-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/cliente'}
            className={({ isActive }) => `flex gap-3 items-center w-full p-4 rounded-button transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold shadow-sm ring-1 ring-brand-200' : 'bg-surface-bg text-slate-700 hover:bg-surface-border'}`}
            aria-label={item.id}
          >
            {({ isActive }) => (
              <>
                <Icon className={isActive ? 'text-brand-600' : 'text-slate-500'} size={24} />
                <span className={`font-['Inter'] ${isActive ? 'text-brand-700' : 'text-slate-600 font-medium'}`}>{item.id}</span>
              </>
            )}
          </NavLink>
        );
      })}
      
      <div className="mt-auto pt-6 border-t border-surface-border">
        <button onClick={logout} className="w-full text-left p-4 rounded-button text-slate-600 hover:bg-surface-border hover:text-slate-900 transition-colors font-bold">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
