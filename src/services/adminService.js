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
  return data.data; // Asumiendo que la respuesta tiene { success: true, data: [...] }
};