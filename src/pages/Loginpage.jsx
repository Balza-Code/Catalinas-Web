import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../services/authServices";
import RegisterPage from "./RegisterPage";


export const Loginpage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Un estado para mostrar errores
  const [showRegister, setShowRegister] = useState(false);

  const auth = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpiamos errores previos

    try{
      // 1. llama al servicio de autenticación
      const data = await loginUser({ email, password });

      // 2. Si tiene éxio, usa la función 'login' del contexto
      // Esto guardará el token en localStorage y actualizará el estado global
      auth.login(data);


    } catch ( error) {
      // Si el servicio lanza un error, lo capturamos y lo mostramos
      setError(error.message)
    }
  };
  return (
    <div className="login-page">
      {showRegister ? (
        <div>
          <button onClick={() => setShowRegister(false)}>Volver al Login</button>
          <RegisterPage />
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Iniciar Sesión</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input type="password" 
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
          {/* Muestra el mensaje de error si existe */}
          {error && <p className="error-message">{error}</p>}
          <p>
            ¿Aún no tienes cuenta? <button type="button" onClick={() => setShowRegister(true)}>Crear cuenta</button>
          </p>
        </form>
      )}
    </div>
  );
};
