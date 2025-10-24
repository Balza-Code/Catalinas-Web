import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { registerUser } from "../services/authServices";

export const RegisterPage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await registerUser({ nombre, email, password });
      // Si el backend devuelve token + user, logueamos automáticamente
      if (data && data.token && data.user) {
        auth.login(data);
      }
    } catch (err) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleRegister}>
        <h2>Registrarse</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Crear cuenta</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
