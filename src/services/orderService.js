const API_URL = "http://localhost:4000/api/orders";

export const getOrders = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los pedidos");
  return await response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error("Error al crear el pedido");
  return await response.json();
};

export const updateOrder = async (id, newStatus) => {
   const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStatus),
  });
  if (!response.ok) throw new Error("Error al actualizar el pedido");
  return await response.json();
}
