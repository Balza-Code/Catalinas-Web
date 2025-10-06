import { Router } from "express";
import Catalina from "../models/catalina.js"; // Importamos nuestro modelo

const router = Router();

// Ruta para crear una nueva catalina (POST)
// La ruta será /api/catalinas

router.post("/", async (req, res) => {
  try {
    // req.body contiene la información que nos envía el frontend (React)
    const nuevaCatalina = new Catalina(req.body);
    await nuevaCatalina.save(); // Guardamos el nuevo documento en la base de datos

    //Respondemos al frontendcon un código 201 ( Creado ) y el onjeto guardado
    res.status(201).json(nuevaCatalina);
  } catch (error) {
    // Si hay un error (ej. falta un campo requerido), enviamos un error
    res.status(400).json({ mensaje: "Error al crear la catalina", error });
  }
});

// Ruta para obtener todas las catalinas (GET)
// La ruta será /api/catalinas
router.get("/", async (req, res) => {
  try {
    // Usamos el modelo para buscar todos los documentos en la colección 'catalinas'
    const catalinas = await Catalina.find();
    res.json(catalinas); // Enviamos la lista como respuesta
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las catalinas", error });
  }
});

// Ruta para Eliminar un producto por su ID (DELETE)
// Usamos ':id' para indicar que esta parte de la url es un parámetro variable
router.delete("/:id", async (req, res) => {
  try {
    // obtenemos el ID de los parámetros de la URL (req.params)
    const { id } = req.params;

    // Usamos el método findByIdAndDelete de Mongoose
    const catalinaEliminada = await Catalina.findByIdAndDelete(id);

    // Si no se encuentra un documento con ese ID, Mongoose devuelve null
    if (!catalinaEliminada) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    // Si se elimina con éxito, enviamos un mensaje de confirmación
    res.json({ mensaje: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el producto: ", error });
  }
});

// Ruta para Actualiza una catalina por su ID (PUT)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datosAActualizar = req.body;

    // Buscamos y actualizamos el documento en un solo paso
    // { new:true } asegura que la respuesta devuelve el documento actualizado
    const catalinaActualizada = await Catalina.findByIdAndUpdate(
      id,
      datosAActualizar,
      { new: true }
    );

    if (!catalinaActualizada) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json(catalinaActualizada); // Devolvemos el documento con los nuevos datos

  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al actualizar el producto: ", error });
  }
});

export default router;
