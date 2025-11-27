import { getAuthHeaders } from "./orderService";

// const API_URL = "http://localhost:4000/api/catalinas";
// src/services/orderService.js

// Vite inyectará automáticamente la URL correcta dependiendo de dónde esté corriendo
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_URL = `${BASE_URL}/catalinas`;

// ... resto del código

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
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al eliminar la catalina");
  return await response.json();
};

export const uploadCatalinaImage = async (catalinaId, formData) => {
  const response = await fetch(`${API_URL}/${catalinaId}/upload-image`, {
    method: 'POST',
    // Usamos getAuthHeaders(true) para que ponga el token PERO NO el Content-Type
    headers: getAuthHeaders(true), 
    body: formData
  });
  if (!response.ok) throw new Error('Error al subir la imagen');
  return await response.json();
};
