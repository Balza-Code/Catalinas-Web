import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  },
  unidad: {
    type: String,
    required: true,
    trim: true,
    default: 'kg'
  },
  costoUnitario: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  categoria: {
    type: String,
    default: 'Masa'
  }
});

const recipeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  rendimientoEstimado: {
    type: Number,
    required: true,
    min: 1
  },
  unidadesPorPaquete: {
    type: Number,
    default: 1 // Si es 10, entonces cada "paquete" trae 10 unidades
  },
  tipoProductoAsociado: {
    type: String,
    enum: ['Paquete', 'Unidad'],
    default: 'Paquete'
  },
  usaMelado: {
    type: Boolean,
    default: false
  },
  rendimientoMelado: {
    type: Number,
    default: 24 // Litros que rinde cocinar el melado entero
  },
  meladoUsadoPorTanda: {
    type: Number,
    default: 6.8 // Litros que se usan en la tanda
  },
  productoAsociado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Catalina',
    required: false
  },
  ingredientes: [ingredientSchema]
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
