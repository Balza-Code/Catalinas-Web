import Catalina from '../models/catalina.js';
import Order from '../models/order.js';
import User from '../models/user.js';
import { parseWhatsAppMessageToOrder } from '../services/aiOrderService.js';

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
    const { event, data } = req.body;

    // 1. Ignorar cualquier evento que NO sea de mensajes
    if (event && event !== 'messages.upsert') {
      return res.status(200).json({
        success: true,
        message: `Evento '${event}' recibido e ignorado correctamente.`,
      });
    }

    // 2. Extraer teléfono de Evolution o del body directo
    const rawPhone = 
      req.body.phone || 
      data?.key?.remoteJid || 
      data?.sender || 
      '';

    const normalizedPhone = normalizePhone(rawPhone);

    // 3. Extraer texto del mensaje
    let messageText =
      req.body.messageText ||
      data?.message?.conversation ||
      data?.message?.extendedTextMessage?.text ||
      '';

    // 4. Extraer nombre del cliente
    let nombreCliente = 
      req.body.nombreCliente || 
      data?.pushName || 
      'Cliente WhatsApp';

    let rawItems = req.body.items;
    let metodoPago = req.body.metodoPago;
    let notas = req.body.notas;

    // Si entra un mensaje sin texto (sticker, nota de voz, etc.)
    if (!messageText && !rawItems) {
      return res.status(200).json({
        success: true,
        message: 'Petición o mensaje sin texto/items procesables. Ignorado con éxito.',
      });
    }

    // Validar teléfono
    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo obtener un teléfono válido del mensaje o petición.',
      });
    }

    // 5. Interpretar mensaje con la IA
    if (messageText && typeof messageText === 'string') {
      const parsedData = await parseWhatsAppMessageToOrder(messageText, normalizedPhone);

      nombreCliente = parsedData.nombreCliente || nombreCliente;
      rawItems = parsedData.items;
      metodoPago = parsedData.metodoPago || metodoPago;
      notas = parsedData.notas || notas;
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudieron extraer productos del mensaje para crear el pedido.',
      });
    }

    // 6. Buscar o crear cliente en BD
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

    // 7. Procesar productos y totales
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

    // 8. Crear la orden en MongoDB
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