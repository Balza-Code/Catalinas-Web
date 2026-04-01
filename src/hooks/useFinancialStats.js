import { useEffect, useState } from 'react';
import { getFinancialStats } from '../services/adminService';

const initialStats = {
  ingresosTotales: 0,
  capitalReinversion: 0,
  gananciaNeta: 0,
  metaSemanal: 0,
  pedidos: [],
};

export const useFinancialStats = (token, periodo) => {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refresh = () => setReloadIndex((current) => current + 1);

  useEffect(() => {
    const loadStats = async () => {
      if (!token) {
        console.log("🛑 DETENIDO: No hay token en useFinancialStats"); // Agrega esto
        setStats(initialStats);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🚀 Haciendo fetch a /api/admin/stats...");
        setError(null);
        const data = await getFinancialStats(token, periodo);
        setStats({
          ingresosTotales: data.ingresosTotales ?? 0,
          capitalReinversion: data.capitalReinversion ?? 0,
          gananciaNeta: data.gananciaNeta ?? 0,
          metaSemanal: data.metaSemanal ?? 0,
          pedidos: Array.isArray(data.pedidos) ? data.pedidos : [],
        });
      } catch (err) {
        setError(err.message || 'Error al cargar estadísticas financieras');
        setStats(initialStats);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [token, periodo, reloadIndex]);

  return { stats, loading, error, refresh };
};
