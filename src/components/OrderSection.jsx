import { useContext, useEffect, useState } from "react";
import { createOrder } from "../services/orderService";
import { AuthContext } from "../context/AuthContext";
import Cart from "../Icons/Cart.png";

// OrderSection: presentational component that delegates order creation to a prop
export default function OrderSection({ catalinas = [], onOrderPlace }) {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);
  const [customerName, setCustomerName] = useState(user ? user.nombre : "");

  // --- 2. NUEVO ESTADO: Controla si el carrito móvil está visible ---
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  useEffect(() => {
    if (user && user.nombre) {
      setCustomerName(user.nombre);
    }
  }, [user]);

  const addToCart = (catalina) => {
    // 1. Revisa si la catalina ya está en el carrito
    const existingItem = cart.find((item) => item._id === catalina._id);
    if (existingItem) {
      // 2. Si existe, actualiza su cantidad
      setCart(
        cart.map((item) =>
          item._id === catalina._id
            ? { ...item, cantidad: item.cantidad + 1 } // Incrementa la cantidad
            : item
        )
      );
    } else {
      // 3. Si no existe, añadela al carrito con cantidad 1
      setCart([...cart, { ...catalina, cantidad: 1 }]);
    }
  };

  const removeFromCart = (catalinaId) => {
    const existingItem = cart.find((item) => item._id === catalinaId);

    if (existingItem.cantidad === 1) {
      // 1.Si solo queda 1, quita el producto del carrito
      setCart(cart.filter((item) => item._id !== catalinaId));
    } else {
      // 2. Si hay más de 1, solo reduce la cantidad
      setCart(
        cart.map((item) =>
          item._id === catalinaId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
      );
    }
  };
  const calculateTotal = () => {
    //  Ahora multiplicamos precio por cantidad;
    return cart
      .reduce((total, item) => total + item.precio * item.cantidad, 0)
      .toFixed(2);
  };

  const handleSubmitOrder = async () => {
    if (!customerName || cart.length === 0) {
      alert("El carrito está vacio o no se identificó al usuario");
      // setIsMobileCartOpen(false);
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
  // Calculamos cantidad total de items para el numerito rojo (badge)
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="md:grid md:grid-cols-[1fr_1fr] gap-2 p-4  rounded-lg w-full max-h-full">
      <div className="col-span-1 rounded-lg border border-gray-200  overflow-y-auto p-4 md:max-h-[565px] bg-white no-scrollbar shadow shadow-gray-100 h-full md:h-[540px]">
        <h2 className="h6 text-gray-700 mb-4">Hacer un pedido</h2>
        <div className="grid grid-cols-2 overflow-y-scroll">
          {catalinas.map((c) => (
            <div
              key={c._id}
              className="rounded-lg flex flex-col items-start  p-4 h-80  bg-gray-50 "
            >
              <div className="w-full h-full flex items-center justify-center bg-(--primary-100) rounded">
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.nombre}
                    className="min-w-[150xpx]"
                  />
                )}
              </div>

              <div className="mt-2 gap-1">
                <h4 className="b1 text-gray-600">{c.nombre}</h4>
                <p className="b3 text-gray-400">{c.descripcion}</p>
                <p className="b1 font-bold text-gray-600">{c.precio} USD</p>
                <button
                  onClick={() => addToCart(c)}
                  className="mt-1 px-4 py-2 bg-(--accent-300) hover:bg-(--accent-400) text-gray-50 rounded-lg b2"
                >
                  Añadir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setIsMobileCartOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-amber-600 text-white p-4 rounded-full shadow-2xl md:hidden transition-transform active:scale-95 flex items-center justify-center"
      >
        <img src={Cart} />
        {/* Badge con el número de items */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {totalItems}
          </span>
        )}
      </button>

      <div
        className={`fixed inset-0 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          isMobileCartOpen ? "translate-y-0" : "translate-y-[2000px]"
        } md:col-span-1 md:translate-y-0 md:static  rounded-lg border border-gray-200  overflow-y-auto p-4 max-h-[565px] bg-white`}
      >
          <h2 className="hidden md:block h6 text-gray-600 mb-4">Tu Pedido</h2>
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center mb-4">
          <h2 className="h6 text-gray-600 mb-4">Tu Pedido</h2>
          <button
            onClick={() => setIsMobileCartOpen(false)}
            className="p-2 bg-gray-100 rounded-full"
          >
            <span>x</span>
          </button>
        </div>
        {cart.length > 0 ? (
          <ul className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
            {cart.map((item) => (
              <li
                key={item._id}
                className="flex items-center gap-3 bg-white p-2 rounded"
              >
                {/* Miniatura */}
                <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.nombre}
                      className="max-h-full object-contain"
                    />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1">
                  <span className="b2 block text-gray-600">
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span className="b3 text-gray-400">${item.precio} c/u</span>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="font-dm-sans md:text-xs text-red-700  bg-red-300 py-2 px-4 md:py1 md:px-2 rounded-lg hover:bg-red-400 hover:text-red-900"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="b2 text-gray-500">El carrito está vacío.</p>
        )}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <h4 className="b1 text-gray-700 font-dm-sans">Total:</h4>
            <h4 className="b2 text-gray-700 font-dm-sans">
              ${calculateTotal()}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleSubmitOrder}
            className="mt-3 w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-50 b1 rounded"
          >
            Registrar Venta
          </button>
        </div>
      </div>
      {isMobileCartOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileCartOpen(false)}
        ></div>
      )}
    </div>
  );
}
