import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * RequireAuth wrapper that can also restrict by role.
 * Props:
 * - roles: optional array of allowed roles (e.g. ['admin'])
 */
const RequireAuth = ({ children, roles = null }) => {
  const { token, user } = React.useContext(AuthContext);

  // Not authenticated -> go to login
  if (!token) return <Navigate to="/login" replace />;

  // If roles provided, check user's role
  if (roles && roles.length > 0) {
    const userRole = user?.role || null;
    if (!userRole || !roles.includes(userRole)) {
      // If the user is authenticated but not authorized for this area,
      // redirect to a safe page according to their role.
      // Non-admin users go to the client dashboard.
      return <Navigate to="/cliente" replace />;
    }
  }

  return children || null;
};

export default RequireAuth;
