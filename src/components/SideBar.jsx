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
  ];

  return (
    <nav className="sidebar">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/admin'}
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
};
