import express from 'express';
import { getAdminClientesResume, createAdminCliente, getFinancialStats, updateMetaSemanal } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Ruta para obtener resumen de clientes para admin
router.get('/clientes-resume', protect, adminOnly, getAdminClientesResume);
// Ruta principal para obtener todos los clientes de CRM
router.get('/clientes', protect, adminOnly, getAdminClientesResume);
router.get('/stats', protect, adminOnly, getFinancialStats);
router.put('/settings/meta', protect, adminOnly, updateMetaSemanal);
// Ruta para crear clientes físicos / de CRM desde el panel admin
router.post('/clientes', protect, adminOnly, createAdminCliente);

export default router;