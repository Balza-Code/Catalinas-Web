import { Outlet } from 'react-router-dom';
import { CustomerSidebar } from '../CustomerSidebar';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MobileHeader } from '../MobileHeader';
import { MobileBottomNav } from '../MobileBottomNav';

const CustomerLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-surface-bg">
      {/* Sidebar hidden on mobile (Fixed Position) */}
      <div className="hidden md:flex w-64 flex-col bg-surface-card border-r border-surface-border z-30 fixed top-0 left-0 h-screen">
        <div className="p-5 border-b border-surface-border bg-surface-card">
            <h2 className="font-black text-xl text-brand-600 tracking-tight uppercase">Panel Cliente</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Hola, {user?.nombre}</p>
        </div>
        <CustomerSidebar logout={logout}/>
      </div>

      <main className="flex-1 w-full flex flex-col mb-14 md:mb-0 md:ml-64">
        <MobileHeader logout={logout} />
        <header className="hidden md:flex w-full h-16 bg-surface-card border-b border-surface-border items-center px-6 sticky top-0 z-50 shadow-sm">
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Bienvenido, {user?.nombre}</h1>
        </header>

        <div className="flex-1 w-full p-2 md:p-6">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default CustomerLayout;