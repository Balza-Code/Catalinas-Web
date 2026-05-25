import { NavLink } from 'react-router-dom';
import BoardIcon from './icons/BoardIcon';
import AddIcon from './icons/AddIcon';
import SalesIcon from './icons/SalesIcon';
import HistoryIcon from './icons/HistoryIcon';
import UserIcon from './icons/UserIcon';
import PosIcon from './icons/PosIcon';

export const SideBar = ({ logout }) => {
  const menuItems = [
    { id: 'General-dashboard', icon: BoardIcon, path: '/admin' },
    { id: 'Directorio de Clientes', icon: UserIcon, path: '/admin/clientes' },
    { id: 'Agregar Productos', icon: AddIcon, path: '/admin/productos' },
    { id: 'Historial de Pedidos', icon: HistoryIcon, path: '/admin/historial' },
    { id: 'Finanzas', icon: BoardIcon, path: '/admin/finanzas' },
    { id: 'Punto de Venta POS', icon: PosIcon, path: '/admin/pos' },
    { id: 'Calculadora', icon: SalesIcon, path: '/admin/calculadora' },
    { id: 'Producción', icon: BoardIcon, path: '/admin/produccion' },
  ];

  return (
    <nav className="sidebar flex flex-col h-full bg-surface-card border-r border-surface-border shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `flex gap-3 items-center w-full py-3 px-4 rounded-button transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-50 text-brand-700 font-bold shadow-sm ring-1 ring-brand-500/20' 
                  : 'text-slate-500 hover:bg-surface-bg hover:text-slate-800'
              }`}
              aria-label={item.id}
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? 'text-brand-600' : 'text-slate-400'} size={20} />
                  <span className={`font-['Inter'] text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.id}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-surface-border bg-surface-card">
        <button 
          onClick={logout} 
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-status-danger bg-status-danger/5 hover:bg-status-danger/10 rounded-button transition-colors border border-status-danger/10"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};
