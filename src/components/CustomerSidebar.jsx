import { NavLink } from 'react-router-dom';
import SalesIcon from './icons/SalesIcon';
import HistoryIcon from './icons/HistoryIcon';

export const CustomerSidebar = ({ logout }) => {
  const menuItems = [
    { id: 'Hacer un Pedido', icon: SalesIcon, path: '/cliente' },
    { id: 'Historial de Pedidos', icon: HistoryIcon, path: '/cliente/historial' },
  ];

  return (
    <nav className="sidebar">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/cliente'}
            className={({ isActive }) => `flex gap-3 items-center w-full py-4 px-3 rounded-lg transition-colors ${isActive ? 'bg-amber-200 font-bold' : 'hover:bg-amber-100'}`}
            aria-label={item.id}
          >
            {({ isActive }) => (
              <>
                <Icon style={{ color: isActive ? 'var(--primary-500)' : '#9CA3AF' }} size={20} />
                <span className="s b3 font-[Inter]" style={{ color: isActive ? 'var(--primary-500)' : undefined }}>{item.id}</span>
              </>
            )}
          </NavLink>
        );
      })}
      <button onClick={logout} className="mt-6 px-3 py-2 text-sm text-gray-600">Cerrar Sesión</button>
    </nav>
  );
}
