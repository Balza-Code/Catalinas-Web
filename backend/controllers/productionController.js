import ProductionBatch from '../models/ProductionBatch.js';
import Recipe from '../models/Recipe.js';
import Catalina from '../models/catalina.js';

// ─── GET /api/production ───────────────────────────────────────────────────────
// Devuelve todas las tandas, con datos de la receta populados.
// Filtrar por estado: GET /api/production?estado=En%20Proceso
export const getBatches = async (req, res) => {
  try {
    const filter = {};
    if (req.query.estado) {
      filter.estado = req.query.estado;
    }

    const batches = await ProductionBatch.find(filter)
      .populate({
        path: 'recetaId',
        select: 'nombre rendimientoEstimado productoAsociado tipoProductoAsociado unidadesPorPaquete',
        populate: { path: 'productoAsociado', select: 'nombre stock' },
      })
      .sort({ createdAt: -1 });

    res.json(batches);
  } catch (error) {
    console.error('getBatches error:', error);
    res.status(500).json({ error: 'Error al obtener las tandas de producción.' });
  }
};

// ─── POST /api/production/start ───────────────────────────────────────────────
// Inicia una nueva tanda en estado 'En Proceso'.
// Body: { recetaId, cantidadEsperada, costoTotalTanda?, notas? }
export const startBatch = async (req, res) => {
  try {
    const { recetaId, cantidadEsperada, costoTotalTanda, notas } = req.body;

    if (!recetaId || !cantidadEsperada) {
      return res
        .status(400)
        .json({ error: 'recetaId y cantidadEsperada son obligatorios.' });
    }

    // Verificar que la receta existe
    const receta = await Recipe.findById(recetaId);
    if (!receta) {
      return res.status(404).json({ error: 'Receta no encontrada.' });
    }

    const nuevaTanda = new ProductionBatch({
      recetaId,
      cantidadEsperada,
      costoTotalTanda: costoTotalTanda || 0,
      notas: notas || '',
      estado: 'En Proceso',
    });

    await nuevaTanda.save();

    // Devolver con datos populados
    const tandaPopulada = await ProductionBatch.findById(nuevaTanda._id).populate({
      path: 'recetaId',
      select: 'nombre rendimientoEstimado productoAsociado tipoProductoAsociado unidadesPorPaquete',
      populate: { path: 'productoAsociado', select: 'nombre stock' },
    });

    res.status(201).json(tandaPopulada);
  } catch (error) {
    console.error('startBatch error:', error);
    res.status(500).json({ error: 'Error al iniciar la tanda.' });
  }
};

// ─── PATCH /api/production/:id/close ─────────────────────────────────────────
// Cierra una tanda y actualiza el stock de la Catalina asociada (en paquetes).
// Body: { cantidadRealObtenida }
export const closeBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidadRealObtenida } = req.body;

    if (cantidadRealObtenida === undefined || cantidadRealObtenida < 0) {
      return res
        .status(400)
        .json({ error: 'cantidadRealObtenida es obligatoria y debe ser >= 0.' });
    }

    const tanda = await ProductionBatch.findById(id);
    if (!tanda) {
      return res.status(404).json({ error: 'Tanda no encontrada.' });
    }
    if (tanda.estado !== 'En Proceso') {
      return res
        .status(400)
        .json({ error: `La tanda ya está en estado "${tanda.estado}".` });
    }

    // 1. Cerrar la tanda
    tanda.estado = 'Completada';
    tanda.cantidadRealObtenida = cantidadRealObtenida;
    await tanda.save();

    // 2. Actualizar stock de inventario —————————————————————————————
    // Buscar la receta para obtener el productoAsociado
    const receta = await Recipe.findById(tanda.recetaId);
    let stockActualizado = null;
    let advertencia = null;

    if (receta && receta.productoAsociado) {
      // Incrementar el stock en PAQUETES usando $inc (operación atómica)
      const catalinaActualizada = await Catalina.findByIdAndUpdate(
        receta.productoAsociado,
        { $inc: { stock: cantidadRealObtenida } },
        { new: true, select: 'nombre stock' }
      );
      stockActualizado = catalinaActualizada;
    } else {
      advertencia =
        'La receta no tiene un producto asociado. Stock no actualizado.';
      console.warn(`closeBatch: receta ${tanda.recetaId} sin productoAsociado.`);
    }

    // 3. Devolver respuesta
    const tandaPopulada = await ProductionBatch.findById(id).populate({
      path: 'recetaId',
      select: 'nombre rendimientoEstimado productoAsociado tipoProductoAsociado unidadesPorPaquete',
      populate: { path: 'productoAsociado', select: 'nombre stock' },
    });

    res.json({
      tanda: tandaPopulada,
      stockActualizado,
      ...(advertencia && { advertencia }),
    });
  } catch (error) {
    console.error('closeBatch error:', error);
    res.status(500).json({ error: 'Error al cerrar la tanda.' });
  }
};

// ─── PATCH /api/production/:id/cancel ────────────────────────────────────────
// Cancela una tanda SIN tocar el inventario.
export const cancelBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const tanda = await ProductionBatch.findById(id);

    if (!tanda) {
      return res.status(404).json({ error: 'Tanda no encontrada.' });
    }
    if (tanda.estado !== 'En Proceso') {
      return res
        .status(400)
        .json({ error: `La tanda ya está en estado "${tanda.estado}".` });
    }

    tanda.estado = 'Cancelada';
    await tanda.save();

    res.json(tanda);
  } catch (error) {
    console.error('cancelBatch error:', error);
    res.status(500).json({ error: 'Error al cancelar la tanda.' });
  }
};
