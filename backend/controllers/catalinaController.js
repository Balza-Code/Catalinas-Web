import { v2 as cloudinary } from 'cloudinary';
import Catalina from '../models/catalina.js';


// Cada función se exporta para poder ser usada por el archivo de rutas.

export async function getAllCatalinas(req, res) {
  try {
    const catalinas = await Catalina.find();
    res.json(catalinas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las catalinas', error });
  }
}

export async function createCatalina(req, res) {
  try {
    const nuevaCatalina = new Catalina(req.body);
    await nuevaCatalina.save();
    res.status(201).json(nuevaCatalina);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la catalina', error });
  }
}

export async function updateCatalina(req, res) {
  try {
    const catalinaActualizada = await Catalina.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!catalinaActualizada) {
      return res.status(404).json({ mensaje: 'Catalina no encontrada' });
    }
    res.json(catalinaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la catalina', error });
  }
}

export async function deleteCatalina(req, res) {
  try {
    const catalinaEliminada = await Catalina.findByIdAndDelete(req.params.id);
    if (!catalinaEliminada) {
      return res.status(404).json({ mensaje: 'Catalina no encontrada' });
    }
    res.json({ mensaje: 'Catalina eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la catalina', error });
  }
}

export async function uploadCatalinaImage( req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo' });
    }

    // 1. Busca el producto
    const catalina = await Catalina.findById(req.params.id);
    if (!catalina) {
      return res.status(404).json({ mensaje: 'Catalina no encontrada' });
    }

    // 2. Sube la imagen a Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream({ folder: "productos" }, async (error, result) => {
      if (error) {
        return res.status(500).json({ mensaje: 'Error al subir a Cloudinary', error });
      }

      // 3. Guarda la URL en el producto y lo actualiza
      catalina.imageUrl = result.secure_url;
      const catalinaActualizada = await catalina.save();

      res.json(catalinaActualizada);
    });

    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error("ERROR AL SUBIR IMAGEN DE PRODUCTO:", error);
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
} 
