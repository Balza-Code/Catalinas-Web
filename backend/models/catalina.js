import mongoose from "mongoose";

// definimos el schema (el molde) para nuestras catalinas
const catalinaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, //El nombre es obligatorio
    trim: true  // Elimina espacios en blanco al inicio y al final
  },
  precio: {
    type: Number,
    required: true, //El precio es obligatorio
    min: 0   // El precio no puede ser negativo
  },
  descripcion: {
    type: String,
    trim: true
  },
  disponible: {
    type: Boolean,
    default: true  //Por defecto, un producto nuevo está disponible
  } 
  }, {
    timestamps: true //Esto anade automáticamente los campos createdAt y updateAt
})

// Creamos el Modelo a partir del Schema
// Catalina es el nombre que le damos al modelo. Moongose lo pluralizará
// y buscará la colección 'catalinas en la base de datos.
const Catalina = mongoose.model('Catalina', catalinaSchema);

export default Catalina; // Exportamos el modelo como ESM

