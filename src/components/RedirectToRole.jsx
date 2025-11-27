import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const RedirectToRole = () => {
  const { token, user } = React.useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/cliente" replace />;
};

export default RedirectToRole;
