import Catalina from '../models/catalina.js';
import { GoogleGenAI } from '@google/genai';

const formatProductList = (products) => {
  if (!products || products.length === 0) {
    return 'No hay productos disponibles.';
  }

  return products
    .map((product) => `- ${product.nombre} ($${product.precio?.toFixed(2) || '0.00'})`)
    .join('\n');
};

const buildPrompt = (products, messageText) => {
  const productList = formatProductList(products);

  return `Eres el asistente de ventas de la fábrica de catalinas de Ildefonso Balza. Tu objetivo es clasificar los mensajes entrantes de WhatsApp y, SI CORRESPONDE, interpretar los pedidos de clientes.

Catálogo de productos disponibles (Venta por PAQUETE):
${productList}

REGLAS DE CLASIFICACIÓN DE INTENCIÓN (MUY IMPORTANTE):
1. EVALÚA LA INTENCIÓN ("esPedido"):
   - Coloca "esPedido": true ÚNICAMENTE si el mensaje expresa una intención explícita de COMPRAR o SOLICITAR un nuevo despacho ahora (Ej: "Mándame 2 paquetes", "Necesito 5 negras", "Traeme 3 bultos").
   - Coloca "esPedido": false si el mensaje es:
     * Un recordatorio de deudas o mercancía pendiente pasada (Ej: "Ayer quedaron debiendo 2 paquetes", "Quería recordarle que estamos pendientes con 2 paquetes").
     * Saludos, bendiciones, citas bíblicas, preguntas casuales o conversación general (Ej: "Dios te bendiga", "Llegó hoy a Caracas", "Ok perfecto").
     * Preguntas de disponibilidad o precios sin solicitud explícita de envío.

2. UNIDAD DE VENTA: Todas las cantidades mencionadas ("dos catalinas", "3 negras", "5 bultos") representan PAQUETES completos, NO galletas sueltas.
3. PRODUCTOS DESCONOCIDOS / CONSULTAS: Si el cliente pregunta por productos que NO están en el catálogo (ej: "cortado", "besitos de coco"), NO los agregues a "items". Agrega esa consulta dentro del campo "notas".
4. RECLAMOS Y DEVOLUCIONES: Si el cliente reporta mercancía dañada ("se mosearon", "vinieron rotas"), NO reduzcas el pedido automáticamente. Registra el nuevo pedido en "items" y coloca el detalle en "notas".
5. SABOR POR DEFECTO: Si pide "catalinas" sin especificar color/sabor, asigna "Catalina Negra" e indica en "notas" que el sabor no fue especificado.
6. IDENTIFICACIÓN DEL VENDEDOR VS CLIENTE: El dueño/vendedor de la fábrica se llama "Ildefonso Balza" (o "Sr. Balza", "Alfonso", "Ilde"). Si el mensaje empieza saludándolo a él, NUNCA asignes esos nombres a 'nombreCliente'. Si el cliente no dice su propio nombre, asigna "Cliente WhatsApp".

Mensaje/Transcripción del cliente:
"${messageText}"

Responde ÚNICAMENTE con un objeto JSON con este esquema exacto:
{
  "esPedido": true,
  "razonClasificacion": "Explicación breve de por qué es o no es un pedido",
  "nombreCliente": "Nombre o apodo del cliente si se identifica, de lo contrario 'Cliente WhatsApp'",
  "items": [
    { "nombre": "Nombre EXACTO del producto del catálogo", "cantidad": 1 }
  ],
  "metodoPago": "Efectivo | Pago Móvil | Divisas | Pendiente",
  "notas": "Cualquier reclamo, consulta de productos no vendidos o aclaraciones"
}`;
};

const callAIModel = async (prompt) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openAiKey) {
    throw new Error('No hay clave de API de IA configurada. Define GEMINI_API_KEY o OPENAI_API_KEY en el .env.');
  }

  // 1. Usar Gemini (Opción Recomendada)
  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json' // Exige respuesta JSON pura
      }
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('No se pudo obtener respuesta de texto desde Gemini.');
    }

    return rawText;
  }

  // 2. Fallback a OpenAI si no hay GeminiKey
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: openAiKey });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  return completion.choices[0]?.message?.content || null;
};

export const parseWhatsAppMessageToOrder = async (messageText, userPhone) => {
  if (!messageText || typeof messageText !== 'string') {
    throw new Error('messageText es obligatorio y debe ser una cadena.');
  }

  if (!userPhone || typeof userPhone !== 'string') {
    throw new Error('userPhone es obligatorio y debe ser una cadena.');
  }

  // Obtener catálogo disponible de MongoDB
  const products = await Catalina.find({ disponible: true }).select('nombre precio').lean();

  const prompt = buildPrompt(products, messageText);
  const aiResponseText = await callAIModel(prompt);

  let parsed;
  try {
    parsed = JSON.parse(aiResponseText);
  } catch (err) {
    throw new Error(`Error al parsear el JSON devuelto por la IA: ${err.message}`);
  }

  // 🛑 SI LA IA DETERMINA QUE NO ES UN PEDIDO NUEVO:
  if (parsed.esPedido === false) {
    return {
      esPedido: false,
      razon: parsed.razonClasificacion || 'El mensaje no contiene una orden de compra activa.',
      phone: userPhone
    };
  }

  // Cruzar ítems devueltos con los productos reales para garantizar precios de BD
  const itemsProcesados = Array.isArray(parsed.items)
    ? parsed.items
        .map((item) => {
          const prodBD = products.find(
            (p) => p.nombre.toLowerCase() === String(item.nombre || '').toLowerCase()
          );

          return {
            nombre: prodBD ? prodBD.nombre : String(item.nombre || '').trim(),
            cantidad: Math.max(1, Number(item.cantidad) || 1),
            precio: prodBD ? prodBD.precio : (Number(item.precio) || 0)
          };
        })
        .filter((item) => item.nombre.length > 0)
    : [];

  // Si fue marcado como pedido pero no trajo ítems válidos, lo anulamos limpiamente
  if (itemsProcesados.length === 0) {
    return {
      esPedido: false,
      razon: 'No se identificaron productos válidos del catálogo en la solicitud.',
      phone: userPhone
    };
  }

  return {
    esPedido: true,
    nombreCliente: parsed.nombreCliente?.trim() || 'Cliente WhatsApp',
    items: itemsProcesados,
    metodoPago: ['Efectivo', 'Pago Móvil', 'Divisas', 'Pendiente'].includes(parsed.metodoPago)
      ? parsed.metodoPago
      : 'Pendiente',
    notas: String(parsed.notas || '').trim(),
    phone: userPhone,
  };
};