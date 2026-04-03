import { Children, StrictMode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'
import './index.css'
import AdminLayout from './components/layout/AdminLayout.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import CustomerDashboard from './components/CustomerDashboard.jsx'
import { AgregarProductosPage } from './pages/AgregarProductosPage.jsx'
import { HistorialDePedidosPage } from './pages/HistorialDePedidosPage.jsx'
import POS from './pages/POS.jsx';
import { Loginpage } from './pages/Loginpage.jsx';
import RequireAuth from './components/RequireAuth.jsx'
import RedirectToRole from './components/RedirectToRole.jsx'
import CustomerLayout from './components/layout/CustomerLayout.jsx';
import CustomerNewOrderPage from './pages/CustomerNewOrder.jsx'
import ClientHistoryPage from './pages/ClientHistoryPage.jsx';
import ClientDirectory from './pages/ClientDirectory.jsx';
import InvestmentCalculator from './components/InvestmentCalculator.jsx';
import ProductionPanel from './pages/ProductionPanel.jsx';
import FinancialDashboard from './components/FinancialDashboard.jsx';
import { HashRouter } from 'react-router-dom';

const protectedRoutes = {
  path: 'admin',
  element: (
    <RequireAuth roles={["admin"]}>
      <AdminLayout className='max-h-full' />
    </RequireAuth>
  ),
  children: [
    { index: true, element: <AdminDashboard/> },
    { path: 'productos', element: <AgregarProductosPage/> },
    { path: 'historial', element: <HistorialDePedidosPage/> },
    { path: 'clientes', element: <ClientDirectory/> },
    { path: 'finanzas', element: <FinancialDashboard/> },
    { path: 'calculadora', element: <InvestmentCalculator/> },
    { path: 'pos', element: <POS/> },
    { path: 'produccion', element: <ProductionPanel/> }
  ]
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RedirectToRole /> // decide si va a /admin o /cliente según rol
  },
  {
    path: '/login',
    element: <Loginpage />
  },
  {
    path: '/cliente',
    element: (
      <RequireAuth roles={["cliente"]}>
            <CustomerLayout /> {/* Usamos el Layout aquí */}
          </RequireAuth>
    ),
    children: [
      { index: true, element: <CustomerNewOrderPage /> },
      { path: 'historial', element: <ClientHistoryPage /> }
    ]
  },
  protectedRoutes
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <RouterProvider router={router} />
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
)
