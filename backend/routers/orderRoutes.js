import { Router } from "express";
import Order from "../models/order.js";

const router = Router();

// Ruta para CREAR un nuevo pedido
router.post("/", async (req, res) => {
  try {
    const nuevoPedido = new Order(req.body);
    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el pedido", error });
  }
});

// Ruta para OBTENER TODOS los pedidos
router.get("/", async (req, res) => {
  try {
    // .sort({createdAt: -1 }) para que los más nuevos aparezcan primero
    const pedidos = await Order.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los pedidos", error });
  }
});

// Ruta para ACTUALIZAR el estado de un pedido por du ID (PATCH)
// Usamos PATCH porque sollo vamos a modificar una pequeña parte del pedido ( El estado )

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Obtenemos el nuevo estado del cuerpo de la petición
    const { estado } = req.body;

    const pedidoActualizado = await Order.findByIdAndUpdate(
      id,
      { estado: estado }, // Actualizamos solo el camppo estado
      { new: true } // Para que nos devuelva el documento ya actualizado
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el pedido", error });
  }
});

export default router;
