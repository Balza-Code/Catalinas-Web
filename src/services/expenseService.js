const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_URL = `${BASE_URL}/expenses`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const getExpenses = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener los gastos");
  return await response.json();
};

export const createExpense = async (expenseData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(expenseData),
  });
  if (!response.ok) {
    let errMsg = "Error al crear el gasto";
    try {
      const data = await response.json();
      if (data && data.mensaje) errMsg = data.mensaje;
    } catch (e) {}
    throw new Error(errMsg);
  }
  return await response.json();
};

export const deleteExpense = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    let errMsg = "Error al eliminar el gasto";
    try {
      const data = await response.json();
      if (data && data.mensaje) errMsg = data.mensaje;
    } catch (e) {}
    throw new Error(errMsg);
  }
  return await response.json();
};
