import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ token, setTokern ] = useState(localStorage.getItem('token'));

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setTokern(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokern(null);
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}