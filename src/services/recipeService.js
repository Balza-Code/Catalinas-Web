import { getAuthHeaders } from "./orderService";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_URL = `${BASE_URL}/admin/recipes`;

export const getRecipes = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener las recetas");
  const data = await response.json();
  return data.data; // Retorna el array de recetas
};

export const createRecipe = async (recipeData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(recipeData),
  });
  if (!response.ok) throw new Error("Error al crear la receta");
  const data = await response.json();
  return data.data;
};

export const updateRecipe = async (id, recipeData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(recipeData),
  });
  if (!response.ok) throw new Error("Error al actualizar la receta");
  const data = await response.json();
  return data.data;
};
