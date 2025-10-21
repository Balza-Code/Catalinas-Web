const API_URL = "http://localhost:4000/api/auth";

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(credentials), // credentials será {email, password}
  });

  const data = await res.json();
  if (!res.ok) {
    // Si el backend envía un error (ej. credenciales invalidads) lo lanzamos
    throw new Error(data.mensaje || "Error al iniciar sesión");
  }
  return data; // Devuelve el objeto { token: '...' }
};

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(userData), // userData será { nombre, email, password }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.mensaje || 'Error al registrarse');
  }
  return data;
};
