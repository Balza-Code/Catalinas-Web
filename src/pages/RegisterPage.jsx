import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { registerUser } from "../services/authServices";
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

export const RegisterPage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { showModal } = useModal();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await registerUser({ nombre, email, password });
      // Mostramos modal de registro correcto y redirigimos al login
      showModal({
        title: 'Registro completo',
        message: 'Te has registrado correctamente. Debes dirigirte al login.',
        onClose: () => navigate('/login')
      });
    } catch (err) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Crea tu cuenta
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-2">Únete a la plataforma hoy mismo</p>
      </div>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full px-4 py-3 bg-surface-bg border border-surface-border rounded-button text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        />
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
        Completar Registro
      </button>
    </form>
  );
};

export default RegisterPage;
