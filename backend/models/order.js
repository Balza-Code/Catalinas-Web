import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Guardamos una copia de los items que el pedido cambie si el proceso es modificado despues.
    items: [
      {
        nombre: String,
        precio: Number,
        cantidad: Number,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    clienteNombre: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      required: true,
      default: "Pendiente",
    },
    tipoVenta: {
      type: String,
      required: true,
      default: "Pedido Online",
    },
    comprobanteUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
