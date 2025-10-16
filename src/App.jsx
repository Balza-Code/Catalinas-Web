import { useState } from "react";
import "./App.css";
// 1. Importamoos el nuevo componente del formulario
import AdminDashboard from "./components/AdminDashboard";
import useOrders from "./hooks/useOrders";

function App() {
  // 1. Estado para guardad la lista de catalinas
  const [catalinas, setCatalinas] = useState([]);

  const { orders, setOrders, loading, createOrder } = useOrders();
  

  // ---Nuevos estados para la edición---
  // Guarda el ID del producto que se está editando.
  const [editingId, setEditingId] = useState(null);
  // Guarda los datos del formularion de eición
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
  });

  

  // 2. Creamos una función para manejar la adición de una nueva catalina.
  // Esta función recibirá la nueva catalina creada desde el formulario
  const handleCatalinaAdded = (nuevaCatalina) => {
    // Añadimos la nueva catalina a la lista existente en el estado
    // para que la pantalla se actualice sin tener que recargar
    setCatalinas([...catalinas, nuevaCatalina]);
  };

  // ---Nueva Función para Eliminar
  const handleDeleteCatalina = async (id) => {
    // Pedimos confirmación al usuario para evitar borrados accidentales
    if (
      !window.confirm("¿Estas seguro de que quieres eliminar este producto?")
    ) {
      return;
    }

    // try {
    //   const response = await fetch(
    //     `http://localhost:4000/api/catalinas/${id}`,
    //     {
    //       method: "DELETE",
    //     }
    //   );
      
    //     // Si el backend confirma la eliminación, actualizamos el estado en el frontend
    //     // Filtramos la lista, creando un nuevo array sin el elemento eliminado
    //     setCatalinas(catalinas.filter((catalina) => catalina._id !== id));
    //   } else {
    //     alert("Error al eliminar la catalina");
    //   }
    // } catch (error) {
      
    // }
  };

  // ---Nuevas Funciones para la edición---
  // 1. Cuando se haga click en "editar"
  const handleEditClick = (catalina) => {
    setEditingId(catalina._id); // Marcamos este proucto como "en edición"
    setEditFormData({
      // Llenamos el formulario con sus datos actuales
      nombre: catalina.nombre,
      precio: catalina.precio,
      descripcion: catalina.descripcion,
    });
  };

  // 2. Cuando se cambia algo en el formulario de edición
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // 3. Cuando se envía el formulario de edición
  const handleUpdateSubmit = async (event) => {
    event.preventDefault(); // Evitamos que la página se recargue

    try {
      

       {
        // Actualizamos la lista de catalinas con los nuevos datos
        const newList = catalinas.map((c) =>
          c._id === editingId ? updateCatalina : c
        );
        setCatalinas(newList);
        setEditingId(null); // Salimos del modo edición
      }
    } catch (error) {
    }
  };

  const handleOrderPlaced = (newOrder) => {
    setOrders([newOrder, ...orders]); // Añaimos el nuevo pedido al principio de la lista
  };

  // Nueva función para cambiar el estado del pedido
  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      

      
    } catch (error) {
    }
  };

  const handleReceiptUploaded = (updateOrder) => {
    // Actualizamos la lista de pedidos para reflejar que se añadió  la URL del comprobante
    setOrders(orders.map(order => 
      order._id === updateOrder._id ? updateOrder : order
    ));
  };

  return (
    <>
      <div className="app-container">
        <h1>Panel de venta de Catalinas</h1>
        <AdminDashboard />
        <hr />
        {/* OrderSection se encarga solo de la UI; la creación la recibe por prop */}
        

      </div>
    </>
  );
}

export default App;
