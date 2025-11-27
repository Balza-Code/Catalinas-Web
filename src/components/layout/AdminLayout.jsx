import React, { useContext } from "react";
import { Outlet } from "react-router-dom"; // 1. Importa Outlet
import { SideBar } from "../SideBar";
import { AuthContext } from "../../context/AuthContext";
import { MobileHeader } from "../MobileHeader";
import { MobileBottomNav } from "../MobileBottomNav";

function AdminLayout() {
  const { token, user, logout } = useContext(AuthContext);

  return (
    <div className="flex max-h-full md:max-h-screen">
      {/* 2. El Sidebar Fijo */}
      <div className="hidden md:flex w-64 flex-col max-h-full z-20">
        <div className="p-4 border border-gray-200">
            <h2 className="font-bold text-xl text-amber-600">Panel {user?.role}</h2>
            <p className="text-sm text-gray-500">Hola, {user?.nombre}</p>
        </div>
        <SideBar logout={logout} /> 
      </div>

      {/* 3. El Contenido Variable */}
      <main className="flex-1 w-full flex flex-col mb-14 md:mb-0 ">
        {/* Aquí es donde React Router "pintará" la página
            (Dashboard, Ventas, Historial, etc.) */}

            <MobileHeader logout={logout} />
        {token && (
          <header className="hidden md:flex w-full h-16 border-b border-gray-200 items-center">
            <h1 className="h6 p-4">Bienvenido {user?.nombre}</h1>
            <span></span>
          </header>
        )}
        <div className=" md:mt-0 z-20 max-h-full bg-[#f5f0e6] p-4">

        <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default AdminLayout;
