import Catalina from '../models/catalina.js';
import Order from '../models/order.js';
import User from '../models/user.js';
import { parseWhatsAppMessageToOrder } from '../services/aiOrderService.js'; // 👈 1. Importamos el servicio de IA

const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '');
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return /^\d{8,15}$/.test(digits);
};

const findCatalinaByIdOrName = async (item) => {
  if (item.catalinaId) {
    const catalinaById = await Catalina.findById(item.catalinaId).lean();
    if (catalinaById) {
      return catalinaById;
    }
  }

  if (item.nombre) {
    const regex = new RegExp(`^${item.nombre.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
    return Catalina.findOne({ nombre: regex }).lean();
  }

  return null;
};

export const handleWhatsAppOrder = async (req, res) => {
  try {
    let {
      phone,
      nombreCliente,
      items: rawItems,
      metodoPago,
      notas,
      messageText, // 👈 2. Leemos el texto crudo del mensaje si existe
    } = req.body;

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'phone es obligatorio',
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'phone debe contener entre 8 y 15 dígitos válidos',
      });
    }

    // 👈 3. MAGIA IA: Si la petición trae el mensaje crudo de WhatsApp, procesamos primero con Gemini
    if (messageText && typeof messageText === 'string') {
      const parsedData = await parseWhatsAppMessageToOrder(messageText, normalizedPhone);
      
      // Sobrescribimos o rellenamos con lo que interpretó Gemini
      nombreCliente = parsedData.nombreCliente || nombreCliente;
      rawItems = parsedData.items;
      metodoPago = parsedData.metodoPago || metodoPago;
      notas = parsedData.notas || notas;
    }

    if (!nombreCliente || !nombreCliente.trim()) {
      return res.status(400).json({
        success: false,
        message: 'nombreCliente es obligatorio',
      });
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items es obligatorio y debe contener al menos un producto',
      });
    }

    const existingUser = await User.findOne({ phone: normalizedPhone }).lean();
    let userId;

    if (existingUser) {
      userId = existingUser._id;
    } else {
      const newUser = await User.create({
        nombre: nombreCliente.trim(),
        phone: normalizedPhone,
        role: 'cliente',
        metadataCRM: {
          origen: 'WhatsApp_Bot',
        },
      });
      userId = newUser._id;
    }

    const processedItems = [];
    let totalUSD = 0;
    let costoTotalProduccion = 0;

    for (const item of rawItems) {
      const cantidad = Number(item.cantidad) || 0;
      if (cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: `La cantidad de '${item.nombre || 'item'}' debe ser mayor a 0`,
        });
      }

      const catalogItem = await findCatalinaByIdOrName(item);
      const precio = Number(catalogItem?.precio ?? item.precio);
      const costoProduccion = Number(catalogItem?.costoProduccion ?? (item.costoProduccion || 0));
      const nombre = catalogItem?.nombre ?? item.nombre ?? 'Producto sin nombre';

      if (!precio || precio <= 0) {
        return res.status(400).json({
          success: false,
          message: `El precio de '${nombre}' debe ser un número mayor a 0`,
        });
      }

      const itemTotal = precio * cantidad;
      const itemCosto = costoProduccion * cantidad;

      processedItems.push({
        nombre,
        precio,
        cantidad,
        costoProduccion,
      });

      totalUSD += itemTotal;
      costoTotalProduccion += itemCosto;
    }

    const newOrder = await Order.create({
      user: userId,
      clienteNombre: nombreCliente.trim(),
      items: processedItems,
      total: totalUSD,
      costoTotalProduccion,
      tipoVenta: 'Venta WhatsApp',
      estado: 'Pendiente',
      estadoPago: 'Pendiente de Pago',
      metodoPago: metodoPago || 'Efectivo',
      notas: notas || '',
    });

    res.status(201).json({
      success: true,
      orderId: newOrder._id,
      message: 'Pedido registrado desde WhatsApp con éxito',
    });
  } catch (error) {
    console.error('Error en handleWhatsAppOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al registrar el pedido',
      error: error.message,
    });
  }
};