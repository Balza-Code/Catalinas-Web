import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Router } from "express";
import multer from "multer";
import {
  createOrder,
  getAllOrders,
  updateOrder,
  uploadReceipt
} from "../controllers/orderController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});


router.get("/", protect, getAllOrders);
router.post("/", protect, createOrder);
router.patch("/:id", protect, adminOnly, updateOrder);

// La ruta de subida de archivos también llama a su función de controlador
router.post(
  "/:id/upload-receipt",
  protect,
  upload.single("comprobante"),
  uploadReceipt
);

export default router;
