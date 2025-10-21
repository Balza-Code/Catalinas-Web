import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Router } from "express";
import multer from "multer";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  uploadReceipt
} from "../controllers/orderController.js";

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

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getAllOrders);
router.post("/", createOrder);
router.patch("/:id", updateOrderStatus);

// La ruta de subida de archivos también llama a su función de controlador
router.post(
  "/:id/upload-receipt",
  upload.single("comprobante"),
  uploadReceipt
);

export default router;
