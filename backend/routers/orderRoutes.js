import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Router } from "express";
import multer from "multer";
import streamifier from "streamifier";
import Order from "../models/order.js";


// Cargamos las variables de entorno aquí para asegurar que están disponibles
// cuando el módulo se evalúe (importar este router antes de dotenv en el
// entrypoint puede causar que cloudinary se configure sin las credenciales).
dotenv.config();

const router = Router();

// Configuración de cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de multer
// Le decimos a  multer que guarde el archivo en memoria temporalmente
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para CREAR un nuevo pedido
router.post("/", async (req, res) => {
  try {
    const nuevoPedido = new Order(req.body);
    await nuevoPedido.save();
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear el pedido", error });
  }
});

// Ruta para OBTENER TODOS los pedidos
router.get("/", async (req, res) => {
  try {
    // .sort({createdAt: -1 }) para que los más nuevos aparezcan primero
    const pedidos = await Order.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los pedidos", error });
  }
});

// Ruta para ACTUALIZAR el estado de un pedido por du ID (PATCH)
// Usamos PATCH porque sollo vamos a modificar una pequeña parte del pedido ( El estado )

router.patch("/:id", async (req, res) => {
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
});

// Nueva ruta para subir el comprobante (POST)
router.post(
  "/:id/upload-receipt",
  upload.single("comprobante"),
  async (req, res) => {
      console.log("¡Recibida petición para subir comprobante! Revisando archivo..."); 

    try {
      if (!req.file) {
        return res.status(400).json({ mensaje: "No se subió ningún archivo " });
      }
      // Subimos el archivo a CLouddinary desde el buffer de memoria
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "comprobantes" },
        async (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({ mensaje: "Error al subir a Cloudinary", error: error.message || 'Error desconocido' });
          }

          const pedido = await Order.findByIdAndUpdate(
            req.params.id,
            { comprobanteUrl: result.secure_url },
            { new: true }
          );

          if (!pedido) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
          }

          return res.json(pedido);
        }
      );

      // Convertimos el buffer en stream y lo enviamos
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
          

      res.status(500).json({ mensaje: "Error en el servidor", 
        error: error.message || "Error desconocido"
       });
    }
  }
);


export default router;
