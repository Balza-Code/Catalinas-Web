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

router.post('/webhook', validateBotApiKey, handleWhatsAppOrder);
router.post('/parse-test', validateBotApiKey, parseTestHandler);

export default router;
