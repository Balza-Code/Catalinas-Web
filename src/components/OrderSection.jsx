import { useState } from "react";
import { createOrder } from "../services/orderService";

// OrderSection: presentational component that delegates order creation to a prop
export default function OrderSection({ catalinas = [], onOrderPlace }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");

  const addToCart = (catalina) => {
    setCart((prev) => [...prev, { ...catalina, cantidad: 1 }]);
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  };

  const handleSubmitOrder = async () => {
    if (!customerName || cart.length === 0) {
      alert("Por favor, añade productos y escribe tu nombre.");
      return;
    }

    const orderData = {
      clienteNombre: customerName,
      items: cart.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: parseFloat(calculateTotal()),
      tipoVenta: "Pedido Online",
      estado: "Pendiente",
    };

    try {
      let newOrder;
      if (typeof onOrderPlace === "function") {
        newOrder = await onOrderPlace(orderData);
      } else {
        newOrder = await createOrder(orderData);
      }
      // If parent didn't add the order to list, it's still created by service/hook
      setCart([]);
      setCustomerName("");
      alert("¡Pedido realizado con éxito!");
      return newOrder;
    } catch (error) {
      console.error("Error al crear el pedido", error);
      alert("Hubo un error al realizar el pedido");
      throw error;
    }
  };

  return (
    <div className="order-section">
      <h2>Hacer un pedido</h2>
      <div className="catalina-selection">
        <h3>Productos Disponibles</h3>
        {catalinas.map((c) => (
          <button type="button" key={c._id} onClick={() => addToCart(c)}>
            Añadir {c.nombre} (${c.precio})
          </button>
        ))}
      </div>
      <div className="cart">
        <h3>Carrito de Compras</h3>
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.nombre} - ${item.precio}
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
  );
}
