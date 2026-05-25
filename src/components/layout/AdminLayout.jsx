import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom"; // 1. Importa Outlet
import { SideBar } from "../SideBar";
import { AuthContext } from "../../context/AuthContext";
import { MobileHeader } from "../MobileHeader";
import { MobileBottomNav } from "../MobileBottomNav";
import { useModal } from "../../context/ModalContext";
import ExpenseForm from "../ExpenseForm";

function AdminLayout() {
  const { token, user, logout } = useContext(AuthContext);
  const { showModal, hideModal } = useModal();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const openExpenseModal = () => {
    setIsExpenseModalOpen(true);
    showModal({
      title: 'Registrar Gasto',
      children: (
        <ExpenseForm onExpenseCreated={() => {
          hideModal();
          setIsExpenseModalOpen(false);
          setToast({ msg: 'Gasto registrado correctamente.', type: 'success' });
          setTimeout(() => setToast(null), 3200);
        }} />
      ),
      onClose: () => setIsExpenseModalOpen(false),
    });
  };

  const handleToastClose = () => setToast(null);

  return (
    <div className="flex min-h-screen bg-surface-bg">
      {/* 2. El Sidebar Fijo (Realmente Fijo) */}
      <div className="hidden md:flex w-64 flex-col bg-surface-card border-r border-surface-border z-30 fixed top-0 left-0 h-screen">
        <div className="p-5 border-b border-surface-border bg-surface-card">
            <h2 className="font-black text-xl text-brand-600 tracking-tight uppercase">Panel {user?.role}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">Hola, {user?.nombre}</p>
        </div>
        <SideBar logout={logout} /> 
      </div>

      {/* 3. El Contenido Variable */}
      <main className="flex-1 w-full flex flex-col mb-24 md:mb-0 md:ml-64">
        <MobileHeader logout={logout} />
        {token && (
          <header className="hidden md:flex w-full h-16 bg-surface-card border-b border-surface-border items-center justify-between px-6 sticky top-0 shadow-sm">
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Bienvenido, {user?.nombre}</h1>
            <button
              type="button"
              onClick={openExpenseModal}
              className="bg-brand-50 text-brand-700 border border-brand-200 font-bold px-4 py-2 rounded-button flex items-center gap-2 hover:bg-brand-100 transition-colors shadow-sm text-sm"
            >
              ➖ Registrar Gasto
            </button>
          </header>
        )}

        {toast && (
          <div className="fixed top-6 right-6 z-50 w-[min(320px,calc(100%-2rem))] rounded-card border border-brand-200 bg-brand-50 p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-button bg-brand-200 p-2 text-brand-700">✓</div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-brand-900 tracking-tight">{toast.type === 'success' ? '¡Operación Exitosa!' : 'Aviso'}</p>
                <p className="text-sm font-semibold text-brand-700 mt-1">{toast.msg}</p>
              </div>
              <button onClick={handleToastClose} className="text-brand-500 hover:text-brand-700 font-bold">✕</button>
            </div>
          </div>
        )}

        <div className="flex-1 w-full p-2 md:p-6">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}

export default AdminLayout;
