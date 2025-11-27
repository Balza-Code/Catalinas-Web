import { v2 as cloudinary } from "cloudinary";
import { Router } from "express";
import multer from "multer";

import {
  createCatalina,
  deleteCatalina,
  getAllCatalinas,
  updateCatalina,
  uploadCatalinaImage
} from '../controllers/catalinaController.js';
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

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


const router = Router();

// Ruta para crear una nueva catalina (POST)
// La ruta será /api/catalinas

// El "Recepcionista" ahora solo dirige el tráfico.

// GET /api/catalinas -> Obtener todas
router.get('/', getAllCatalinas);

// POST /api/catalinas -> Crear una
router.post('/', protect, adminOnly, createCatalina);

// PUT /api/catalinas/:id -> Actualizar una
router.put('/:id', protect, adminOnly, updateCatalina);

// DELETE /api/catalinas/:id -> Eliminar una
router.delete('/:id', protect, adminOnly, deleteCatalina);

router.post(
  '/:id/upload-image',
  protect,
  adminOnly,
  upload.single('imagenProducto'), // El nombre del campo será 'imagenProducto'
  uploadCatalinaImage
);

export default router;
