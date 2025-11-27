import { useState } from "react";
import { getAuthHeaders } from "../services/orderService";

// Recibimos una función 'onCatalinaAdded' como prop
// La usaremos para avisarle al componente App que se ha añadido una nueva catalina.

const AddCatalinaForm = ({ onCatalinaAdded }) => {
  // Estados para cada campo del formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoVenta, setTipoVenta] = useState('ambos');

  const handleSubmit = async (event) => {
    // 1. Prevenimos que la página se recargue al enviar el formulario
    event.preventDefault();

    // 2. Creamos el objeto con los datos del nuevo producto
    const nuevaCatalina = {
      nombre,
      // Convertiremos el precio a numero, ya que el input lo devuelve cómo string
      precio: Number(precio),
      descripcion,
      tipoVenta
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
    <form
  onSubmit={handleSubmit}
  className="catalina-form bg-gray-50 p-6 rounded-lg  w-full space-y-4 mx-1 "
>
  <h3 className="h6 text-gray-600 mb-4">Añadir Nueva Catalina</h3>

  {/* Nombre */}
  <input
    type="text"
    placeholder="Nombre"
    value={nombre}
    onChange={(e) => setNombre(e.target.value)}
    required
    className="w-full px-3 py-2 b2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  {/* Precio */}
  <input
    type="number"
    placeholder="Precio"
    value={precio}
    onChange={(e) => setPrecio(e.target.value)}
    className="w-full px-3 py-2 b2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <div className="mb-2">
        <label className="block text-sm font-bold mb-1">Disponible para:</label>
        <select 
          value={tipoVenta} 
          onChange={(e) => setTipoVenta(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="ambos">Ambos (Online y Detal)</option>
          <option value="online">Solo Online (Clientes al Mayor)</option>
          <option value="detal">Solo Venta al Detal (Físico)</option>
        </select>
      </div>

  {/* Descripción */}
  <textarea
    placeholder="Descripción"
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
    rows={3}
    className="w-full px-3 py-2 b2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  {/* Botón */}
  <button
    type="submit"
    className="w-full px-4 py-2 bg-green-500 text-gray-50 b1 rounded hover:bg-green-600 transition font-medium"
  >
    Guardar Catalina
  </button>
</form>

  );
};

export default AddCatalinaForm;
