import express from 'express';
import { createExpense, getExpenses, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Ambas rutas están protegidas y son solo para administradores
router.post('/', protect, adminOnly, createExpense);
router.get('/', protect, adminOnly, getExpenses);
router.delete('/:id', protect, adminOnly, deleteExpense);

export default router;
