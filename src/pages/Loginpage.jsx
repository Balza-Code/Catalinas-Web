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
   <div className="min-h-screen flex items-center justify-center bg-[#f5f0e6] px-4">
      {showRegister ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <button
            onClick={() => setShowRegister(false)}
            className="text-sm text-indigo-600 hover:underline mb-4"
          >
            ← Volver al Login
          </button>
          <RegisterPage />
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Iniciar Sesión
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 "
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 "
          />
          <button
            type="submit"
            className="w-full bg-(--primary-500) text-white py-2 rounded-md hover:bg-(--primary-600) transition-colors duration-200"
          >
            Acceder
          </button>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          <p className="text-sm text-center mt-4">
            ¿No tienes Cuenta?{" "}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-indigo-600 hover:underline"
            >
              Unirme
            </button>
          </p>
        </form>
      )}
    </div>
  );
};
