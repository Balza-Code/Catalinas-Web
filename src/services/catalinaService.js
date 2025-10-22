import { getAuthHeaders } from "./orderService";

const API_URL = "http://localhost:4000/api/catalinas";

export const getCatalinas = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener las catalinas");
  return await response.json();
};

export const createdCatalina = async (catalinaData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(catalinaData),
  });
  if (!response.ok) throw new Error("Error al crear la catalina");
  return await response.json();
};

export const updateCatalina = async (id, catalinaData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(catalinaData),
  });
  if (!response.ok) throw new Error("Error al actualizar la catalina");
  return await response.json();
};

export const deleteCatalina = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar la catalina");
  return await response.json();
};
