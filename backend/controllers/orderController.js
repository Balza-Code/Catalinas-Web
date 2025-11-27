import cloudinary from "cloudinary";
import streamifier from "streamifier";
import Order from "../models/order.js";

const { v2: cloudinaryV2 } = cloudinary;

export async function getAllOrders(req, res) {
  try {
    let pedidos;

    // El middleware 'protec' nos dió req.user
    if (req.user.role === "admin") {
      pedidos = await Order.find().sort({ createdAt: -1 });
    } else {
      pedidos = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    }

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los pedidos", error });
  }
}

export async function createOrder(req, res) {
  try {
    const nuevoPedido = new Order({
      ...req.body, // Trae todo del formulario
      user: req.user.id, // <-- Asigna el ID del usuario logueado
    });
    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el pedido", error });
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body; // Aceptamos 'estado' O 'notas'

    const fieldsToUpdate = {};

    // Construimos el objeto de actualización dinámicamente
    // Si nos envían un 'estado', lo añadimos.
    if (estado) {
      fieldsToUpdate.estado = estado;
    }
    // Si nos envían 'notas', las añadimos.
    // (permitimos 'notas === ""' para poder borrar las notas)
    if (notas || notas === "") {
      fieldsToUpdate.notas = notas;
    }

    // Si no nos enviaron nada para actualizar, devolvemos un error
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ mensaje: "No hay campos para actualizar" });
    }

    const pedidoActualizado = await Order.findByIdAndUpdate(
      id,
      { $set: fieldsToUpdate }, // Usamos $set para actualizar solo estos campos
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }
    res.json(pedidoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el pedido", error });
  }
}

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      { folder: "comprobantes" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function uploadReceipt(req, res) {
  try {
    // 1. Busca el pedido primero
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    // 2. Nueva lógica de permisos
    const esAdmin = req.user.role === "admin";
    const esPropietario = order.user.toString() === req.user.id;

    // Si el usuario NO es admin Y NO es el propietario, se rechaza.
    if (!esAdmin && !esPropietario) {
      return res.status(403).json({
        mensaje: "Acceso denegado. No eres el propietario de este pedido.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: "No se subió ningún archivo" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const pedido = await Order.findByIdAndUpdate(
      req.params.id,
      { comprobanteUrl: result.secure_url },
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    console.error("Error en uploadReceipt:", error);
    res.status(500).json({
      mensaje: "Error al subir el comprobante",
      error: error.message || "Error desconocido",
    });
  }
}
