import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Guardamos una copia de los items que el pedido cambie si el proceso es modificado despues.
    items: [
      {
        nombre: String,
        precio: Number,
        cantidad: Number,
        costoProduccion: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    costoTotalProduccion: {
      type: Number,
      required: true,
      min: 0,
    },
    pagado: {
      type: Number,
      default: 0,
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
    metodoPago: {
      type: String,
      default: "Transferencia/Pago Móvil"
    },
    monedaPago: {
      type: String,
      enum: ["Bs", "USD", "N/A"],
      default: "N/A"
    },
    comprobanteUrl: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    notas: {
      type: String,
      default: '' //Por defecto las notas esta vacias
    }
  },
  {
    timestamps: true,
  }
);

// Si el modelo ya existe en la memoria de Mongoose, lo usa. Si no, lo crea.
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
