import express from 'express';
import { 
  getAdminClientesResume, 
  createAdminCliente, 
  getFinancialStats, 
  updateMetaSemanal,
  getRecipes,
  createRecipe,
  updateRecipe
} from '../controllers/adminController.js';
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

// ================= RECETAS =================
router.get('/recipes', protect, adminOnly, getRecipes);
router.post('/recipes', protect, adminOnly, createRecipe);
router.put('/recipes/:id', protect, adminOnly, updateRecipe);

export default router;