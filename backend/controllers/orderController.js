import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import Order from '../models/Order.js';


const { v2: cloudinaryV2 } = cloudinary;

export async function getAllOrders(req, res) {
  try {
    // .sort({createdAt: -1 }) para que los más nuevos aparezcan primero
    const pedidos = await Order.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los pedidos", error });
  }
};

export async function createOrder(req, res) {
  try {
    const nuevoPedido = new Order(req.body);
    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el pedido", error });
  }
};

export async function updateOrderStatus(req, res) {
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
};

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      { folder: 'comprobantes' },
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
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const pedido = await Order.findByIdAndUpdate(
      req.params.id,
      { comprobanteUrl: result.secure_url },
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error en uploadReceipt:', error);
    res.status(500).json({
      mensaje: 'Error al subir el comprobante',
      error: error.message || 'Error desconocido',
    });
  }
}

