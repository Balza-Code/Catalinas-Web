import { Router } from "express";
import {
  createCatalina,
  deleteCatalina,
  getAllCatalinas,
  updateCatalina
} from '../controllers/catalinaController.js';
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";


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

export default router;
