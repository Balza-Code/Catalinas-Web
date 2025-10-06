import { useEffect, useState } from "react";
import "./App.css";
// 1. Importamoos el nuevo componente del formulario
import AddCatalinaForm from "./components/AddCatalinaForm";
import VentaDetalForm from "./components/VentaDetalForm";

const OrderSection = ({ catalinas, onOrderPlace }) => {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");

  const addToCart = (catalina) => {
    setCart([...cart, { ...catalina, cantidad: 1 }]);
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  };
  const handleSubmitOrder = async () => {
    if (!customerName || cart.length === 0) {
      alert("Por favor, añade productos y escribe tu nombre. ");
      return;
    }

    const orderData = {
      clienteNombre: customerName,
      items: cart.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: calculateTotal(),
    };

    try {
      const response = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const newOrder = await response.json();
      if (response.ok) {
        alert("¡Pedido realizado con exito!");
        onOrderPlace(newOrder); //Avisamos al componente Principal
        setCart([]);
        setCustomerName("");
      }
    } catch (error) {
      console.error("Error al crear el pedido: ", error);
    }
  };

  return (
    <>
      <div className="order-section">
        <h2>Hacer un pedido</h2>
        <div className="catalina-selection">
          <h3>Productos Disponibles</h3>
          {catalinas.map((c) => (
            <button type="button" key={c._id} onClick={() => addToCart(c)}>
              {" "}
              Añadir {c.nombre} (${c.precio}){" "}
            </button>
          ))}
        </div>
        <div className="cart">
          <h3>Carrito de Compras</h3>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.nombre} - ${item.precio}{" "}
              </li>
            ))}
          </ul>
          <h4>Total: ${calculateTotal()}</h4>
          <input
            type="text"
            placeholder="Tu Nombre"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <button type="button" onClick={handleSubmitOrder}>
            Realizar pedido
          </button>
        </div>
      </div>
    </>
  );
};

function App() {
  // 1. Estado para guardad la lista de catalinas
  const [catalinas, setCatalinas] = useState([]);
  const [orders, setOrders] = useState([]);

  // ---Nuevos estados para la edición---
  // Guarda el ID del producto que se está editando.
  const [editingId, setEditingId] = useState(null);
  // Guarda los datos del formularion de eición
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
  });

  // 2. useEffect para ejecutar el código solo una vez, cuando el componente se monta
  useEffect(() => {
    // 3. Función para pedir los datos a la API

    const fetchData = async () => {
      try {
        const catalinasRes = await fetch("http://localhost:4000/api/catalinas");
        const data = await catalinasRes.json();
        setCatalinas(data); // 4. guardamos los datos recibidos en el estado

        const orderRes = await fetch("http://localhost:4000/api/orders");
        const ordersData = await orderRes.json();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error al obtener los datos: ", error);
      }
    };

    fetchData();
  }, []); // El array vacio asegura que solo se ejecute una vez

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

    try {
      const response = await fetch(
        `http://localhost:4000/api/catalinas/${id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Si el backend confirma la eliminación, actualizamos el estado en el frontend
        // Filtramos la lista, creando un nuevo array sin el elemento eliminado
        setCatalinas(catalinas.filter((catalina) => catalina._id !== id));
      } else {
        alert("Error al eliminar la catalina");
      }
    } catch (error) {
      console.error("Error de red: ", error);
    }
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
      const response = await fetch(
        `http://localhost:4000/api/catalinas/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );

      const updateCatalina = await response.json();

      if (response.ok) {
        // Actualizamos la lista de catalinas con los nuevos datos
        const newList = catalinas.map((c) =>
          c._id === editingId ? updateCatalina : c
        );
        setCatalinas(newList);
        setEditingId(null); // Salimos del modo edición
      }
    } catch (error) {
      console.error("Error al actualizar: ", error);
    }
  };

  const handleOrderPlaced = (newOrder) => {
    setOrders([newOrder, ...orders]); // Añaimos el nuevo pedido al principio de la lista
  };

  // Nueva función para cambiar el estado del pedido
  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      });

      const updateOrder = await response.json();

      if (response.ok) {
        // Actualizamo la lista de pedidios en el forntend par reflejar el cambio
        setOrders(
          orders.map((order) => (order._id === id ? updateOrder : order))
        );
      }
    } catch (error) {
      console.error("Error al actualizar el estado: ", error);
    }
  };

  return (
    <>
      <div className="app-container">
        <h1>Gestión de catalinas</h1>
        <div className="detal-section">
          <h2>Venta Rápida (Al Detal)</h2>
          <VentaDetalForm
            catalinas={catalinas}
            onOrderPlaced={handleOrderPlaced}
          />
        </div>
        <hr />
        <OrderSection catalinas={catalinas} onOrderPlace={handleOrderPlaced} />
        <hr />
        <div className="admin-section">
          <h2>Pedidos Recibidos</h2>
          <div className="ordes-list">
            {orders.map((order) => (
              <div key={orders._id} className="order-card">
                {/* Pequelo cambio para mostrar tipo de venta */}
                <span className="order-type">{order.tipoVenta}</span>
                <h3>Pedido de: {order.clienteNombre} </h3>
                {/* {Hacemos que el estado cambie de color dinámicamente} */}
                <p>
                  Estado:{" "}
                  <strong className={`status-${order.estado.toLowerCase()}`}>
                    {order.estado}
                  </strong>{" "}
                </p>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {" "}
                      {item.cantidad}x {item.nombre} (${item.precio}){" "}
                    </li>
                  ))}
                </ul>
                <h4>Total: ${order.total.toFixed(2)} </h4>
                <small>
                  Fecha: {new Date(order.createdAt).toLocaleString()}{" "}
                </small>

                {/* {Mostramos las acciones solo si el pedido No está entregado/cancelado} */}
                {order.estado !== "Entregado" &&
                  order.estado !== "Cancelado" && (
                    <div className="order-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "En preparación")
                        }
                      >
                        En preparación
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "Entregado")
                        }
                      >
                        Entregado
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "Cancelado")
                        }
                      >
                        Cancelado
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* 3.Renderizamos el formulario y le pasamos la función como prop */}
        <AddCatalinaForm onCatalinaAdded={handleCatalinaAdded} />
        <div className="catalinas-list">
          {/* {5. Mapeamos el array de catalinas para mostrarlas} */}
          {catalinas.map((catalina, index) => (
            <div key={index} className="catalina-card">
              {editingId === catalina._id ? (
                // ---Vista de Edición ( formulario )---
                <form onSubmit={handleUpdateSubmit}>
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditFormChange}
                  />
                  <input
                    type="number"
                    name="precio"
                    id="precio"
                    value={editFormData.precio}
                    onChange={handleEditFormChange}
                  />
                  <textarea
                    name="descripcion"
                    value={editFormData.descripcion}
                    onChange={handleEditFormChange}
                  />
                  <button type="submit">Guardar</button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancelar
                  </button>
                </form>
              ) : (
                // ---Vista Normal (Información)
                <>
                  <h2>{catalina.nombre}</h2>

                  <p>Precio: ${catalina.precio}</p>

                  <p>{catalina.descripcion}</p>

                  <button onClick={() => handleEditClick(catalina)}>
                    Editar
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCatalina(catalina._id)}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
