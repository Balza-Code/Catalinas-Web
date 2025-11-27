import { useState } from "react";
import { getAuthHeaders } from "../services/orderService";
import Cart from "../Icons/Cart.png";

const VentaDetalForm = ({ catalinas, onOrderPlaced }) => {
  const [cart, setCart] = useState([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

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

    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);


  return (
    <div className="md:grid md:grid-cols-2 gap-2 w-full bg-[#f5f0e6]">
      {/* 🟦 Sección de Productos */}
      <div className="col-span-1 rounded-lg border border-gray-200  overflow-y-auto p-4 md:max-h-[565px] bg-white no-scrollbar">
        <h3 className="h6 text-gray-600 mb-4">Productos Disponibles</h3>
        <div className="grid grid-cols-2 gap-4 ">
          {catalinas.map((c) => (
            <div
              key={c._id}
              className="rounded-lg flex flex-col items-start  p-4 h-80 border border-gray-100 shadow shadow-gray-50"
            >
              <div className="w-full h-full flex items-center justify-center bg-(--primary-100) rounded">
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.nombre}
                    className="min-w-[150x]"
                  />
                )}
              </div>
              <div className="mt-2 gap-1">
                <h4 className="b1 text-gray-600">{c.nombre}</h4>
                <p className="b3 text-gray-400">{c.descripcion}</p>
                <p className="b1 font-bold text-gray-600">{c.precio} USD</p>
              </div>
              <button
                onClick={() => addToCart(c)}
                className="mt-1 px-4 py-2 bg-(--accent-300) hover:bg-(--accent-400) text-gray-50 rounded-lg b2"
              >
                Añadir
              </button>
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

      {/* 🟨 Sección del Carrito */}
      <div className={`fixed inset-0 z-50 flex flex-col transition-transform duration-200 ease-in-out ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-[2000px]'} md:col-span-1 md:translate-y-0 md:static  rounded-lg border border-gray-200  overflow-y-auto p-4 max-h-[565px] bg-white`}>
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tu Pedido</h2>
            <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <span>x</span>
            </button>
        </div>
        <h3 className="hidden md:block h6 text-gray-600 mb-6">Carrito de Compra</h3>
        {cart.length > 0 ? (
          <ul className="space-y-3 overflow-y-auto md:max-h-[400px] pr-2">
            {cart.map((item) => (
              <li
                key={item._id}
                className="flex items-center gap-3 bg-white p-2 rounded "
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
            <h4 className="b1 text-gray-700 font-dm-sans">
              ${calculateTotal()}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleRegisterSale}
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
};

export default VentaDetalForm;
