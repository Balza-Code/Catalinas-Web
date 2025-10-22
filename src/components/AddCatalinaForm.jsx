import { useState } from "react";
import { getAuthHeaders } from "../services/orderService";

// Recibimos una función 'onCatalinaAdded' como prop
// La usaremos para avisarle al componente App que se ha añadido una nueva catalina.

const AddCatalinaForm = ({ onCatalinaAdded }) => {
  // Estados para cada campo del formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = async (event) => {
    // 1. Prevenimos que la página se recargue al enviar el formulario
    event.preventDefault();

    // 2. Creamos el objeto con los datos del nuevo producto
    const nuevaCatalina = {
      nombre,
      // Convertiremos el precio a numero, ya que el input lo devuelve cómo string
      precio: Number(precio),
      descripcion,
    };

    try {
      // 3. Hacemos la petición POST al backend, iagual que en Postman
      const response = await fetch("http://localhost:4000/api/catalinas", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(nuevaCatalina),
      });

      const data = await response.json();

      if (response.ok) {
        // 4. si todo fué bien, llamamos a la función que recibimos por props
        onCatalinaAdded(data);
        // Limpiamos el formulario para el siguiente producto
        setNombre("");
        setPrecio("");
        setDescripcion("");
      } else {
        // Si el backend devuelve un error, lo mostramos
        alert(`Error al crear la catalina:  ${data.mensaje}`);
      }
    } catch (error) {
      console.error("Error de red: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="catalina-form">
      <h3>Añadir Nueva Catalina</h3>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <input 
        type="number"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <input 
        type="descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <button type="submit"> Guardar Catalinas</button>
    </form>
  );
};

export default AddCatalinaForm;
