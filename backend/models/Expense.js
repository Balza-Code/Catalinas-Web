import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true
  },
  tasaCambio: {
    type: Number,
    default: 1
  },
  montoCalculadoUSD: {
    type: Number,
    required: true
  },
  moneda: {
    type: String,
    enum: ['Bs', 'USD'],
    required: true
  },
  metodoPago: {
    type: String,
    enum: ['Efectivo USD', 'Efectivo Bs', 'Digital'],
    default: 'Efectivo USD'
  },
  categoria: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Protect against overwrite if hot-reloaded
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export default Expense;
