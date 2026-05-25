import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../services/authServices";
import RegisterPage from "./RegisterPage";
import { useNavigate } from "react-router-dom";


export const Loginpage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Un estado para mostrar errores
  const [showRegister, setShowRegister] = useState(false);
  
  const auth = useContext(AuthContext);

  const navigate=  useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos

    try{
      // 1. llama al servicio de autenticación
      const data = await loginUser({ email, password });

      // 2. Si tiene éxio, usa la función 'login' del contexto
      // Esto guardará el token en localStorage y actualizará el estado global
      auth.login(data);
      navigate('/admin')

    } catch ( error) {
      // Si el servicio lanza un error, lo capturamos y lo mostramos
      setError(error.message)
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-4">
      {showRegister ? (
        <div className="bg-surface-card p-8 rounded-card border border-surface-border shadow-2xl w-full max-w-md">
          <button
            onClick={() => setShowRegister(false)}
            className="text-sm text-brand-600 font-bold hover:text-brand-700 transition-colors mb-4 flex items-center gap-1"
          >
            &larr; Volver al Login
          </button>
          <RegisterPage />
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="bg-surface-card p-8 rounded-card border border-surface-border shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2">Ingresa tus credenciales para acceder</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-bg border border-surface-border rounded-button text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-bg border border-surface-border rounded-button text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-button bg-status-danger/10 border border-status-danger/20 text-center">
              <p className="text-status-danger text-sm font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-brand-500 text-white font-bold py-3 mt-6 rounded-button hover:bg-brand-600 shadow-md transition-all duration-200"
          >
            Acceder al Sistema
          </button>
          
          <p className="text-sm text-center text-slate-500 font-medium mt-6">
            ¿Aún no tienes una cuenta?{" "}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-brand-600 hover:text-brand-700 font-bold transition-colors ml-1"
            >
              Regístrate aquí
            </button>
          </p>
        </form>
      )}
    </div>
  );
};
