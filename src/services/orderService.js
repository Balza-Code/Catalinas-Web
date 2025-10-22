const API_URL = "http://localhost:4000/api/orders";

// Función auxiliar para obtener los encabezados con el token

export const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers = {};

  if (!isFormData) {
    // Para peticiones JSON
    headers['Content-type'] = 'application/json';
  }

  if (token) {
    // Añadimos el token de autorización
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers
};

export const getOrders = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener los pedidos");
  return await response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error("Error al crear el pedido");
  return await response.json();
};

export const updateOrder = async (id, newStatus) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(newStatus),
  });
  if (!response.ok) throw new Error("Error al actualizar el pedido");
  return await response.json();
};

// Funcion Especial
// Esta es diferente porque usa FormData
export const uploadReceipt = async (orderId, formData) => {
  const response = await fetch(`${API_URL}/${orderId}/upload-receipt`, {
    method: 'POST',
    // For FormData we must NOT set Content-Type manually; the browser
    // will set the correct multipart/form-data boundary.
    // Pass `true` to getAuthHeaders so it only adds the Authorization header.
    headers: getAuthHeaders(true),
    body: formData
  });
  if (!response.ok) throw new Error('Error al subir el comprobante');
  return await response.json();
}
