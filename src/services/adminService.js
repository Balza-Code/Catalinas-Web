const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const getClientesResume = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/clientes-resume`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el resumen de clientes');
  }

  const data = await response.json();
  console.log("--- 2. DATOS RECIBIDOS EN EL SERVICIO DE REACT ---");
  console.log(data); // Aquí veremos si llega el JSON correcto

  return data.data; 
};

export const createAdminCliente = async (token, clienteData) => {
  const response = await fetch(`${API_BASE_URL}/admin/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(clienteData),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const mensaje = errorBody?.message || 'Error al crear el cliente';
    throw new Error(mensaje);
  }

  const data = await response.json();
  return data.data;
};

export const getFinancialStats = async (token, periodo) => {
  const response = await fetch(`${API_BASE_URL}/admin/stats?periodo=${encodeURIComponent(periodo)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const mensaje = errorBody?.message || 'Error al obtener estadísticas financieras';
    throw new Error(mensaje);
  }

  const data = await response.json();
  return data;
};

export const updateMetaGoal = async (token, metaSemanal) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings/meta`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ metaSemanal }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const mensaje = errorBody?.message || 'Error al actualizar la meta de reinversión';
    throw new Error(mensaje);
  }

  const data = await response.json();
  return data;
};