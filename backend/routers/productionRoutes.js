import express from 'express';
import {
  getBatches,
  startBatch,
  closeBatch,
  cancelBatch,
} from '../controllers/productionController.js';

const router = express.Router();

// GET  /api/production           → listar tandas (filtrables por ?estado=)
router.get('/', getBatches);

// POST /api/production/start     → iniciar nueva tanda
router.post('/start', startBatch);

// PATCH /api/production/:id/close  → cerrar tanda + actualizar stock
router.patch('/:id/close', closeBatch);

// PATCH /api/production/:id/cancel → cancelar tanda (sin tocar stock)
router.patch('/:id/cancel', cancelBatch);

export default router;
