import { Outlet } from 'react-router-dom';
import { CustomerSidebar } from '../CustomerSidebar';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { MobileHeader } from '../MobileHeader';
import { MobileBottomNav } from '../MobileBottomNav';

const CustomerLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex max-h-screen md:max-h-screen">
      {/* Sidebar hidden on mobile */}
      <div className="hidden md:flex w-64 flex-col max-h-full z-20">
        <div className="p-4 border border-gray-200">
            <h2 className="font-bold text-xl text-amber-600">Panel Cliente</h2>
            <p className="text-sm text-gray-500">Hola, {user?.nombre}</p>
        </div>
        <CustomerSidebar logout={logout}/>
      </div>

      <main className="flex-1 w-full flex flex-col mb-14 md:mb-0">
        <MobileHeader logout={logout} />
        <header className="hidden md:flex w-full h-16 border-b border-gray-200 items-center bg-(--primary-500)">
          <h1 className="h6 p-4 text-white">Bienvenido {user?.nombre}</h1>
          
        </header>

        <div className="md:mt-0 z-20 max-h-full bg-[#f5f0e6] p-4 h-[700px]">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default CustomerLayout;