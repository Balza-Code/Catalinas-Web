import { Router } from "express";
import {
  createCatalina,
  deleteCatalina,
  getAllCatalinas,
  updateCatalina
} from '../controllers/catalinaController.js';

const router = Router();

// Ruta para crear una nueva catalina (POST)
// La ruta será /api/catalinas

// El "Recepcionista" ahora solo dirige el tráfico.

// GET /api/catalinas -> Obtener todas
router.get('/', getAllCatalinas);

// POST /api/catalinas -> Crear una
router.post('/', createCatalina);

// PUT /api/catalinas/:id -> Actualizar una
router.put('/:id', updateCatalina);

// DELETE /api/catalinas/:id -> Eliminar una
router.delete('/:id', deleteCatalina);

export default router;
