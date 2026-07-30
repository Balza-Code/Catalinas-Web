import { Router } from 'express';
import { handleWhatsAppOrder } from '../controllers/botController.js';
import { parseWhatsAppMessageToOrder } from '../services/aiOrderService.js';

const router = Router();



const validateBotApiKey = (req, res, next) => {
  const apiKey = 
    req.body?.apikey || 
    req.header('apikey') || 
    req.header('x-bot-api-key') || 
    req.query?.apikey;  
  
  const expectedKey = process.env.BOT_API_KEY;

  if (!expectedKey) {
    return res.status(500).json({
      success: false,
      message: 'Bot API key no configurada en el servidor',
    });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'API key inválida para el webhook del bot',
    });
  }

  next();
};

// 🔄 DISPATCHER: Maneja la reconexión si cae la sesión o delega a la creación de pedidos
const handleWebhookEvent = async (req, res) => {
  const { event, data } = req.body;

  // 1. Manejo de estado de la conexión (Reconexión automática)
  if (event === 'connection.update') {
    const status = data?.state;
    console.log(`📡 Estado de conexión recibido: ${status}`);

    if (status === 'close') {
      console.warn('⚠️ La conexión de WhatsApp se cerró. Disparando auto-reconexión...');

      const serverUrl = process.env.EVOLUTION_API_URL;
      const apiKey = process.env.EVOLUTION_API_KEY || process.env.BOT_API_KEY;
      const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'catalinas-evolution';

      if (serverUrl && apiKey) {
        try {
          const response = await fetch(`${serverUrl}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: { 'apikey': apiKey }
          });
          const result = await response.json();
          console.log('🔄 Petición de reconexión enviada con éxito:', result);
        } catch (err) {
          console.error('❌ Error al intentar reconectar la instancia:', err.message);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Evento de conexión procesado' });
  }

  // 2. Si es un mensaje entrante, lo pasamos al controlador de pedidos
  return handleWhatsAppOrder(req, res);
};

const parseTestHandler = async (req, res) => {
  try {
    const { messageText, phone } = req.body;
    if (!messageText || !phone) {
      return res.status(400).json({
        success: false,
        message: 'messageText y phone son obligatorios',
      });
    }

    const order = await parseWhatsAppMessageToOrder(messageText, phone);
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error parseando mensaje de WhatsApp:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error interno al parsear el mensaje',
    });
  }
};

// 📌 Ruta apuntando al nuevo handler
router.post('/webhook', validateBotApiKey, handleWebhookEvent);
router.post('/parse-test', validateBotApiKey, parseTestHandler);

export default router;