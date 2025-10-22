import { createContext, useState } from "react";

export const AuthContext = createContext(null);

const getUserFromStorage = () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  } catch (error) {
    // Si el JSON está corrupto (ej. "undefined"), bórralo
    console.error("Error al parsear el usuario de localStorage", error);
    localStorage.removeItem('user');
    return null;
  }
}
 
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(getUserFromStorage);

  const login = (loginData) => {
    // Comprobamos que loginData y sus propiedades existan
    if (loginData && loginData.token && loginData.user) {
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      setToken(loginData.token);
      setUser(loginData.user);
    } else {
      // Si los datos no llegan bien, lanzamos un error
      console.error("Datos de login incompletos:", loginData);
      // Esto ahora sí lo atrapará el .catch() de LoginPage
      throw new Error("El servidor no devolvió los datos de usuario.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return (
    <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
  );
}
