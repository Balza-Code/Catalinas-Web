// Servicio de producción — Todas las llamadas HTTP del módulo de Tandas de Horneado.
// El token se recibe como parámetro (extraído con localStorage.getItem('token') en el componente),
// siguiendo la convención del proyecto definida en CONTEXT.MD.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Obtener todas las tandas (opcionalmente filtradas por estado) ─────────────
export const getBatches = async (token, estado = null) => {
  const url = new URL(`${API_BASE_URL}/production`);
  if (estado) url.searchParams.set('estado', estado);

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'Error al obtener las tandas de producción.');
  }

  return response.json();
};

// ─── Iniciar una nueva tanda ──────────────────────────────────────────────────
export const startBatch = async (token, { recetaId, cantidadEsperada, costoTotalTanda, notas }) => {
  const response = await fetch(`${API_BASE_URL}/production/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recetaId, cantidadEsperada, costoTotalTanda, notas }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'Error al iniciar la tanda.');
  }

  return response.json();
};

// ─── Cerrar una tanda e incrementar el stock del producto asociado ────────────
export const closeBatch = async (token, id, cantidadRealObtenida) => {
  const response = await fetch(`${API_BASE_URL}/production/${id}/close`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cantidadRealObtenida }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'Error al cerrar la tanda.');
  }

  return response.json(); // { tanda, stockActualizado, advertencia? }
};

// ─── Cancelar una tanda (sin modificar el inventario) ────────────────────────
export const cancelBatch = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/production/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'Error al cancelar la tanda.');
  }

  return response.json();
};

// ─── Obtener lista de recetas (para el selector del modal de inicio) ──────────
export const getRecipes = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/recipes`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'Error al obtener las recetas.');
  }

  const data = await response.json();
  // El endpoint /admin/recipes devuelve { data: [...] }
  return Array.isArray(data?.data) ? data.data : data;
};
