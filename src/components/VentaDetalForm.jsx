import { useState } from "react";
import { getAuthHeaders } from "../services/orderService";

const VentaDetalForm = ({ catalinas, onOrderPlaced }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (catalina) => {
    // Lógica para incrementar cantidad si ya existe, o añadirlo  si es nuevo
    const existingItem = cart.find((item) => item._id === catalina._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === catalina._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...catalina, cantidad: 1 }]);
    }
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  };

  const handleRegisterSale = async () => {
    if (cart.length === 0) {
      alert("Añade productos para registrar la venta.");
      return;
    }

    const orderData = {
      clienteNombre: "Cliente Detal", //Nombre genérico para estas ventas
      items: cart.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: calculateTotal(),
      tipoVenta: "Venta Detal", // <-- marcamos el tipo de venta
      estado: "Pendiente", //<-- La marcamos como entregada inmediatamente
    };

    try {
      const response = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      const newOrder = await response.json();
      if (response.ok) {
        alert("Venta al detal registrada!");
        onOrderPlaced(newOrder); // Actalualizamos la lista principl de pedidos
        setCart([]); // Vaciamos el carrito
      }
    } catch (error) {
      console.error("Error al registrar la venta: ", error);
    }
  };

  return (
    <div className="venta-detal-form">
      <h3>Productos</h3>
      <div className="catalina-selection">
        {catalinas.map((c) => (
          <button type="button" key={c._id} onClick={() => addToCart(c)}>
            {c.nombre} (${c.precio})
          </button>
        ))}
      </div>
      <div className="cart">
        <h3>Venta Actual</h3>
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.nombre} - ${item.precio}{" "}
            </li>
          ))}
        </ul>
        <h4>Total ${calculateTotal()}</h4>
        <button
          type="button"
          onClick={handleRegisterSale}
          className="register-sale-btn"
        >
          {" "}
          Registrar Venta
        </button>
      </div>
    </div>
  );
};


export default VentaDetalForm;
