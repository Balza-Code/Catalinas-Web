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

// 🔍 Consultar nombre a Evolution API vía Await si no vino en el webhook
const fetchContactNameFromEvolution = async (phone, baseUrl, apiKey) => {
  try {
    if (!baseUrl || !apiKey) return null;
    
    // Consulta directa a la API de Evolution para traer el perfil del contacto
    const response = await fetch(`${baseUrl}/chat/findContacts/catalinas-evolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({ where: { id: `${phone}@s.whatsapp.net` } }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const contact = Array.isArray(data) ? data[0] : data;
    
    return contact?.pushName || contact?.name || null;
  } catch (error) {
    console.warn('⚠️ No se pudo consultar el contacto en Evolution API:', error.message);
    return null;
  }
};

const findCatalinaByIdOrName = async (item) => {
  if (item.catalinaId) {
    const catalinaById = await Catalina.findById(item.catalinaId).lean();
    if (catalinaById) return catalinaById;
  }

  if (item.nombre) {
    const cleanName = item.nombre.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    let catalogItem = await Catalina.findOne({ 
      nombre: new RegExp(`^${cleanName}$`, 'i') 
    }).lean();

    if (!catalogItem) {
      catalogItem = await Catalina.findOne({ 
        nombre: new RegExp(cleanName, 'i') 
      }).lean();
    }

    return catalogItem;
  }

  return null;
};
const processedMessages = new Set();

export const handleWhatsAppOrder = async (req, res) => {
  try {
    const { event, data } = req.body;

    const messageId = data?.key?.id;
    if (messageId) {
      if (processedMessages.has(messageId)) {
        console.log(`⚠️ Mensaje ${messageId} ya fue procesado. Ignorando duplicado.`);
        return res.status(200).json({ success: true, message: 'Mensaje ya procesado' });
      }
      processedMessages.add(messageId);
      // Limpiar el ID después de 1 minuto para no saturar memoria
      setTimeout(() => processedMessages.delete(messageId), 60000);
    }

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

    // -------------------------------------------------------------
    // 4. BÚSQUEDA Y VÍNCULO DE USUARIO (MONGO DB + EVOLUTION AWAIT)
    // -------------------------------------------------------------
    let existingUser = await User.findOne({ phone: normalizedPhone });
    let userId;
    let nombreCliente;

    if (existingUser) {
      // ✅ SI YA EXISTE: Asignamos el pedido a este cliente y usamos el nombre de BD
      userId = existingUser._id;
      
      // Si el usuario en BD se llamaba 'Cliente WhatsApp' pero Evolution mandó ahora el pushName real, lo actualizamos
      if (existingUser.nombre === 'Cliente WhatsApp' && data?.pushName && data.pushName !== 'undefined') {
        existingUser.nombre = data.pushName.trim();
        await existingUser.save();
      }
      
      nombreCliente = existingUser.nombre;
      console.log(`👤 Pedido asignado a cliente existente: ${nombreCliente} (${normalizedPhone})`);

    } else {
      // 🆕 SI ES NUEVO: Intentamos obtener el pushName con fallback y Await si venía undefined
      let pushName = data?.pushName;

      if (!pushName || pushName === 'undefined') {
        const serverUrl = req.body.server_url || process.env.EVOLUTION_API_URL;
        const apiKey = req.body.apikey || process.env.EVOLUTION_API_KEY;
        
        console.log(`🔍 Pidiendo nombre a Evolution API vía Await para: ${normalizedPhone}...`);
        pushName = await fetchContactNameFromEvolution(normalizedPhone, serverUrl, apiKey);
      }

      nombreCliente = pushName?.trim() || req.body.nombreCliente || 'Cliente WhatsApp';

      const newUser = await User.create({
        nombre: nombreCliente,
        phone: normalizedPhone,
        role: 'cliente',
        metadataCRM: { origen: 'WhatsApp_Bot' },
      });
      userId = newUser._id;
      console.log(`✨ Nuevo cliente creado en BD: ${nombreCliente}`);
    }

    // -------------------------------------------------------------
    // 5. INTERPRETAR MENSAJE CON LA IA
    // -------------------------------------------------------------
    if (messageText && typeof messageText === 'string') {
      console.log(`🤖 Enviando a IA mensaje de ${nombreCliente}: "${messageText}"`);
      const parsedData = await parseWhatsAppMessageToOrder(messageText, normalizedPhone);

      // Si la IA detecta que el cliente dijo explícitamente su nombre en el chat ("Hola soy Juan")
      if (parsedData.nombreCliente && parsedData.nombreCliente.toLowerCase() !== 'cliente whatsapp') {
        nombreCliente = parsedData.nombreCliente;
        // Opcional: actualizar el nombre del usuario en BD
        await User.findByIdAndUpdate(userId, { nombre: nombreCliente });
      }

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

    // -------------------------------------------------------------
    // 6. PROCESAR PRODUCTOS Y TOTALES
    // -------------------------------------------------------------
    const processedItems = [];
    let totalUSD = 0;
    let costoTotalProduccion = 0;

    for (const item of rawItems) {
      const cantidad = Number(item.cantidad) || 0;
      if (cantidad <= 0) continue;

      const catalogItem = await findCatalinaByIdOrName(item);

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

    // -------------------------------------------------------------
    // 7. CREAR LA ORDEN EN MONGO DB
    // -------------------------------------------------------------
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

    console.log(`✅ ¡PEDIDO GUARDADO! ID: ${newOrder._id} a nombre de: ${nombreCliente}`);

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