import express from 'express';
import { getAdminClientesResume } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Ruta para obtener resumen de clientes para admin
router.get('/clientes-resume', protect, adminOnly, getAdminClientesResume);

export default router;