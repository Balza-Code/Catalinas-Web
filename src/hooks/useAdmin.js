import { useState, useEffect } from 'react';
import { getClientesResume } from '../services/adminService';

export const useAdmin = (token) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadClientes = async () => {
      if (!token) {
        setClientes([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getClientesResume(token);
        setClientes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadClientes();
  }, [token, refreshKey]);

  const refreshClientes = () => setRefreshKey((prev) => prev + 1);

  return { clientes, loading, error, refreshClientes };
};