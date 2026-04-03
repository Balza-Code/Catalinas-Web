import mongoose from 'mongoose';

const productionBatchSchema = new mongoose.Schema(
  {
    recetaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    estado: {
      type: String,
      enum: ['En Proceso', 'Completada', 'Cancelada'],
      default: 'En Proceso',
    },
    // Paquetes esperados según el rendimientoEstimado de la receta
    cantidadEsperada: {
      type: Number,
      required: true,
      min: 1,
    },
    // Paquetes reales que salieron del horno (se completa al cerrar la tanda)
    cantidadRealObtenida: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Costo total calculado por la calculadora de recetas
    costoTotalTanda: {
      type: Number,
      default: 0,
    },
    notas: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const ProductionBatch = mongoose.model('ProductionBatch', productionBatchSchema);

export default ProductionBatch;
