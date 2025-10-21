import { useContext } from "react";
import "./App.css";
// 1. Importamoos el nuevo componente del formulario
import AdminDashboard from "./components/AdminDashboard";
import { AuthContext } from "./context/AuthContext";
import { Loginpage } from "./pages/Loginpage";

function App() {
  // 1. Estado para guardad la lista de catalinas
  const { token, logout } = useContext(AuthContext);

  return (
    <>
      <div className="app-container">
        {/* Si hay un token, mostramos el botón de logout y el panel */}
        {token && (
          <div className="header">
            <h1>Panel de venta de Catalinas</h1>
            <button onClick={logout}>Cerrar Sesión</button>
          </div>
        )}
        {/* Renderizado condicional: El corazón de una ruta protegida */}
        {token ? <AdminDashboard /> : <Loginpage />}
        <hr />
      </div>
    </>
  );
}

export default App;
