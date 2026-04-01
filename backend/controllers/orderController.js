import cloudinary from "cloudinary";
import streamifier from "streamifier";
import bcrypt from "bcryptjs";
import Order from "../models/order.js";
import User from "../models/user.js";

const { v2: cloudinaryV2 } = cloudinary;

export async function getAllOrders(req, res) {
  try {
    let pedidos;

    // El middleware 'protect' nos dió req.user
    if (req.user.role === "admin") {
      if (req.query.user) {
        pedidos = await Order.find({ user: req.query.user }).sort({ createdAt: -1 });
      } else {
        pedidos = await Order.find().sort({ createdAt: -1 });
      }
    } else {
      pedidos = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    }

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los pedidos", error });
  }
}

function normalizeText(text = "") {
  return text.trim().toLowerCase();
}

function normalizeEmailName(text = "") {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export async function createOrder(req, res) {
  try {
    const { tipoVenta, clienteNombre } = req.body;
    let orderUserId = req.user.id;

    if (tipoVenta === "detal") {
      const nombreCliente = (clienteNombre || "").trim();

      if (!nombreCliente) {
        return res.status(400).json({ mensaje: "clienteNombre es requerido para ventas al detal" });
      }

      const normalizedNombre = normalizeText(nombreCliente);
      const existingUser = await User.findOne({
        nombre: { $regex: new RegExp(`^${normalizedNombre.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
      });

      if (existingUser) {
        orderUserId = existingUser._id;
      } else {
        const randomPassword = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        const emailName = normalizeEmailName(nombreCliente) || "cliente";
        const tempEmail = `detal_${emailName}_${Date.now()}@catalinas.com`;

        const newUser = new User({
          nombre: nombreCliente,
          email: tempEmail,
          password: hashedPassword,
          role: "cliente",
          createdByAdmin: true,
        });

        await newUser.save();
        orderUserId = newUser._id;
      }
    }

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const costoTotalProduccion = items.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const costo = Number(item.costoProduccion) || 0;
      return acc + costo * cantidad;
    }, 0);

    const orderData = {
      ...req.body,
      user: orderUserId,
      items,
      costoTotalProduccion,
    };

    if (req.user.role === "admin" && req.body.user) {
      orderData.user = req.body.user;
    }

    const nuevoPedido = new Order(orderData);
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

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = order.user.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ mensaje: "Acceso denegado. No eres el propietario de este pedido." });
    }

    if (!isAdmin && typeof estado !== "undefined") {
      if (estado !== "Cancelado") {
        return res.status(403).json({ mensaje: "Solo el administrador puede cambiar el estado a este valor." });
      }
      if (order.estado !== "Pendiente") {
        return res.status(403).json({ mensaje: "Solo se puede cancelar un pedido que aún esté pendiente." });
      }
    }

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

    const { metodoPago, monedaPago } = req.body;

    // Lógica para pagos en Efectivo
    if (metodoPago === 'Efectivo') {
      const pedidoEfectivo = await Order.findByIdAndUpdate(
        req.params.id,
        { 
          metodoPago: 'Efectivo',
          monedaPago: monedaPago || 'N/A',
          estado: 'Por Verificar'
        },
        { new: true }
      );
      
      if (!pedidoEfectivo) {
        return res.status(404).json({ mensaje: "Pedido no encontrado" });
      }
      return res.json(pedidoEfectivo);
    }

    // Lógica para Transferencia/Pago Móvil
    if (!req.file) {
      return res.status(400).json({ mensaje: "No se subió ningún archivo" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const pedido = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        comprobanteUrl: result.secure_url,
        metodoPago: 'Transferencia/Pago Móvil',
        monedaPago: 'Bs',
        estado: 'Por Verificar'
      },
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

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    // Solo admin puede eliminar pedidos
    if (req.user.role !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado. Solo administradores pueden eliminar pedidos." });
    }

    const pedidoEliminado = await Order.findByIdAndDelete(id);

    if (!pedidoEliminado) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.json({ mensaje: "Pedido eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el pedido", error });
  }
}

export async function migrarCostosViejos(req, res) {
  try {
    const pedidos = await Order.find();
    let actualizados = 0;

    for (let pedido of pedidos) {
      let seModifico = false;
      let costoTotalCalculado = 0;

      if (pedido.items && pedido.items.length > 0) {
        pedido.items.forEach(item => {
          // 1. Si al item le falta el costo, se lo ponemos para pasar la validación
          if (item.costoProduccion === undefined || item.costoProduccion === null) {
            item.costoProduccion = 0.91; // Valor por defecto de la Catalina Blanca
            seModifico = true;
          }
          
          // Sumamos a la calculadora total
          const costo = Number(item.costoProduccion) || 0.91;
          const cantidad = Number(item.cantidad) || 1;
          costoTotalCalculado += (costo * cantidad);
        });
      }

      // 2. Si arreglamos algún item, o si faltaba el total general, lo guardamos
      if (!pedido.costoTotalProduccion || pedido.costoTotalProduccion === 0 || seModifico) {
        pedido.costoTotalProduccion = costoTotalCalculado;
        
        // Mongoose requiere que le avisemos si modificamos arrays directamente a veces
        pedido.markModified('items'); 
        
        await pedido.save(); // ¡Ahora Mongoose nos dejará pasar!
        actualizados++;
      }
    }

    res.json({ 
      exito: true,
      mensaje: "¡Migración completada con éxito! 🚀 Mongoose está feliz.", 
      pedidosRevisados: pedidos.length,
      pedidosArreglados: actualizados 
    });

  } catch (error) {
    console.error("Error en migración:", error);
    res.status(500).json({ error: error.message });
  }
}
