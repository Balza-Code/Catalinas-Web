import { useContext } from "react";
import "./App.css";
// 1. Importamoos el nuevo componente del formulario
import AdminDashboard from "./components/AdminDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import { AuthContext } from "./context/AuthContext";
import { Loginpage } from "./pages/Loginpage";
CustomerDashboard;

function App() {
  // 1. Estado para guardad la lista de catalinas
  const { token, user, logout } = useContext(AuthContext);

  const renderDashboard = () => {
    if (!user) return <Loginpage />;

    if(user.role === 'admin'){
      return <AdminDashboard /> // Vista de admin
    } else {
      return <CustomerDashboard /> // Vista del cliente
    }
  };

  return (
    <>
      <div className="app-container">
      {token && (
        <div className="header">
         {/* Saluda al usuario por su nombre */}
          <h1>Panel de {user.role === 'admin' ? 'Administrador' : 'Cliente'} ({user.nombre})</h1>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      )}

      {/* Si no hay token, muestra el Login. Si hay, decide qué panel mostrar. */}
      {token ? renderDashboard() : <Loginpage />}
    </div>
    </>
  );
}

export default App;
