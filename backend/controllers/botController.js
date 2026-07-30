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

// 🔍 Búsqueda mejorada: Si no lo encuentra exacto, busca por coincidencia parcial (ej. "negras" -> "Catalina Negra")
const findCatalinaByIdOrName = async (item) => {
  if (item.catalinaId) {
    const catalinaById = await Catalina.findById(item.catalinaId).lean();
    if (catalinaById) return catalinaById;
  }

  if (item.nombre) {
    const cleanName = item.nombre.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // 1. Intento exacto
    let catalogItem = await Catalina.findOne({ 
      nombre: new RegExp(`^${cleanName}$`, 'i') 
    }).lean();

    // 2. Intento por inclusión (coincidencia parcial) si el exacto falla
    if (!catalogItem) {
      catalogItem = await Catalina.findOne({ 
        nombre: new RegExp(cleanName, 'i') 
      }).lean();
    }

    return catalogItem;
  }

  return null;
};

export const handleWhatsAppOrder = async (req, res) => {
  try {
    const { event, data } = req.body;

    // 1. Ignorar cualquier evento que NO sea de mensajes entrantes
    if (event && event !== 'messages.upsert') {
      return res.status(200).json({
        success: true,
        message: `Evento '${event}' recibido e ignorado correctamente.`,
      });
    }

    // 2. Extraer teléfono priorizando el sender real
    const rawPhone = 
      req.body.phone || 
      data?.sender || 
      data?.key?.remoteJidAlt || 
      data?.key?.remoteJid || 
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

    if (!messageText && !rawItems) {
      return res.status(200).json({
        success: true,
        message: 'Petición sin texto/items procesables. Ignorada.',
      });
    }

    if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
      console.warn('⚠️ Teléfono no válido detectado:', rawPhone);
      return res.status(200).json({
        success: false,
        message: 'No se pudo obtener un teléfono válido del mensaje.',
      });
    }

    // 5. Interpretar mensaje con la IA
    if (messageText && typeof messageText === 'string') {
      console.log(`🤖 Enviando a IA mensaje de ${nombreCliente}: "${messageText}"`);
      const parsedData = await parseWhatsAppMessageToOrder(messageText, normalizedPhone);

      nombreCliente = parsedData.nombreCliente || nombreCliente;
      rawItems = parsedData.items;
      metodoPago = parsedData.metodoPago || metodoPago;
      notas = parsedData.notas || notas;
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      console.warn('⚠️ La IA no pudo extraer items del mensaje:', messageText);
      return res.status(200).json({
        success: false,
        message: 'No se pudieron extraer productos del mensaje.',
      });
    }

    // 6. Buscar o crear cliente en BD
    let existingUser = await User.findOne({ phone: normalizedPhone }).lean();
    let userId;

    if (existingUser) {
      userId = existingUser._id;
    } else {
      const newUser = await User.create({
        nombre: nombreCliente.trim(),
        phone: normalizedPhone,
        role: 'cliente',
        metadataCRM: { origen: 'WhatsApp_Bot' },
      });
      userId = newUser._id;
    }

    // 7. Procesar productos y totales
    const processedItems = [];
    let totalUSD = 0;
    let costoTotalProduccion = 0;

    for (const item of rawItems) {
      const cantidad = Number(item.cantidad) || 0;
      if (cantidad <= 0) continue; // Saltar items con cantidad 0 en lugar de abortar toda la orden

      const catalogItem = await findCatalinaByIdOrName(item);

      // Si no encuentra el item en el catálogo, usa los datos fallback o valores base
      const precio = Number(catalogItem?.precio ?? item.precio ?? 0);
      const costoProduccion = Number(catalogItem?.costoProduccion ?? item.costoProduccion ?? 0);
      const nombre = catalogItem?.nombre ?? item.nombre ?? 'Producto General';

      if (precio <= 0) {
        console.warn(`⚠️ ATENCIÓN: El producto '${nombre}' no tiene un precio válido en el catálogo.`);
        return res.status(200).json({
          success: false,
          message: `El producto '${nombre}' no coincide con ningún catálogo activo o carece de precio.`,
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

    if (processedItems.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Ninguno de los ítems especificados cuenta con cantidad válida.',
      });
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

    console.log('✅ ¡PEDIDO GUARDADO EN MONGO DB! ID:', newOrder._id);

    return res.status(201).json({
      success: true,
      orderId: newOrder._id,
      message: 'Pedido registrado desde WhatsApp con éxito',
    });

  } catch (error) {
    console.error('🔥 Error interno en handleWhatsAppOrder:', error);
    return res.status(200).json({
      success: false,
      message: 'Error interno al registrar el pedido',
      error: error.message,
    });
  }
};