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
        message: 'Te has registrado correctamente. Serás redirigido al login.',
        onClose: () => navigate('/login')
      });
    } catch (err) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
   <form
      onSubmit={handleRegister}
      className=" "
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Registrarse
      </h2>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <button
        type="submit"
        className="w-full bg-(--primary-500) text-white py-2 rounded-md hover:bg-(--primary-600) transition-colors duration-200"
      >
        Crear cuenta
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </form>
  );
};

export default RegisterPage;
