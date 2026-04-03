import Order from '../models/order.js';
import User from '../models/user.js';
import Setting from '../models/Setting.js';
import Expense from '../models/Expense.js';
import Recipe from '../models/Recipe.js';

export const getAdminClientesResume = async (req, res) => {
  try {

    // Revisar cuántos usuarios hay en total en la colección (sin filtros)
    const totalUsuarios = await User.countDocuments();

    // Revisar cuántos tienen exactamente el rol "cliente"
    const clientes = await User.find({ role: 'cliente' }).select('-password').lean();

    const clientesResume = await Promise.all(
      clientes.map(async (cliente) => {
        // 1. AHORA SÍ LE PEDIMOS EL ESTADO A LA BASE DE DATOS
        const pedidos = await Order.find({ user: cliente._id }).select('total pagado estado').lean();

        // 2. Solo contamos los pedidos reales (ignoramos los cancelados para el total)
        const pedidosValidos = pedidos.filter(p => p.estado !== 'Cancelado');
        const totalPedidos = pedidosValidos.length;

        // 3. Monto total gastado (histórico, ignorando cancelados)
        const montoTotalGastado = pedidosValidos.reduce(
          (sum, pedido) => sum + (Number(pedido.total) || 0), 
          0
        );

        // 4. Saldo Deudor (INTELIGENTE)
        const saldoDeudor = pedidos.reduce((sum, pedido) => {
          // Si está cancelado o ya se pagó completo, la deuda es CERO
          if (pedido.estado === 'Cancelado' || pedido.estado === 'Pago Completado') {
            return sum;
          }
          // Si está en otro estado (Pendiente, Entregado), restamos lo que haya abonado
          return sum + ((Number(pedido.total) || 0) - (Number(pedido.pagado) || 0));
        }, 0);

        return {
          userId: cliente._id,
          nombre: cliente.nombre,
          email: cliente.email || '',
          telefono: cliente.telefono || '',
          totalPedidos,
          montoTotalGastado,
          saldoDeudor,
        };
      })
    );


    res.status(200).json({
      success: true,
      data: clientesResume,
    });
  } catch (error) {
    console.error('❌ Error en getAdminClientesResume:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

export const createAdminCliente = async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion, notasCRM } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio para crear un cliente',
      });
    }

    const clienteData = {
      nombre,
      role: 'cliente',
      telefono: telefono || '',
      direccion: direccion || '',
      notasCRM: notasCRM || '',
      createdByAdmin: true,
    };

    if (email) {
      clienteData.email = email.toLowerCase();
    }

    if (password) {
      clienteData.password = password;
    }

    if (!clienteData.password) {
      const randomPart = Math.random().toString(36).slice(2, 10);
      clienteData.password = `${randomPart}${Date.now()}`;
    }

    if (!clienteData.email) {
      const safeNombre = nombre
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '') || 'cliente';
      clienteData.email = `crm_${safeNombre}_${Date.now()}@catalinas.com`;
    }

    const nuevoCliente = await User.create(clienteData);

    res.status(201).json({
      success: true,
      data: {
        userId: nuevoCliente._id,
        nombre: nuevoCliente.nombre,
        email: nuevoCliente.email || '',
        telefono: nuevoCliente.telefono || '',
        direccion: nuevoCliente.direccion || '',
        notasCRM: nuevoCliente.notasCRM || '',
        createdByAdmin: nuevoCliente.createdByAdmin,
      },
    });
  } catch (error) {
    console.error('Error en createAdminCliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al crear el cliente',
      error: error.message,
    });
  }
};

export const updateMetaSemanal = async (req, res) => {
  try {
    const { metaSemanal } = req.body;
    if (typeof metaSemanal === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'metaSemanal es obligatorio',
      });
    }

    const nuevaMeta = Number(metaSemanal);
    if (Number.isNaN(nuevaMeta) || nuevaMeta < 0) {
      return res.status(400).json({
        success: false,
        message: 'metaSemanal debe ser un número válido mayor o igual a 0',
      });
    }

    const setting = await Setting.findOne();
    if (setting) {
      setting.metaSemanal = nuevaMeta;
      await setting.save();
    } else {
      await Setting.create({ metaSemanal: nuevaMeta });
    }

    res.status(200).json({
      success: true,
      data: {
        metaSemanal: nuevaMeta,
      },
    });
  } catch (error) {
    console.error('Error en updateMetaSemanal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al actualizar la meta semanal',
      error: error.message,
    });
  }
};

const getMonday = (date) => {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getFinancialStats = async (req, res) => {
  try {
    const periodoParam = (req.query.periodo || 'semana').toLowerCase();
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    let startDate;
    if (periodoParam === 'mes') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (periodoParam === '30dias') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (periodoParam === '90dias') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = getMonday(today);
    }

    const pedidos = await Order.find({
      estado: 'Pago Completado',
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const gastos = await Expense.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const totalGastos = gastos.reduce((sum, gasto) => sum + (gasto.montoCalculadoUSD || gasto.monto || 0), 0);

    let gastosReinversion = 0;
    let gastosOperativos = 0;

    gastos.forEach(gasto => {
      const valorUSD = gasto.montoCalculadoUSD || gasto.monto || 0;
      if (gasto.categoria === 'Materia Prima' || gasto.categoria === 'Empaque') {
        gastosReinversion += valorUSD;
      } else if (gasto.categoria === 'Personal' || gasto.categoria === 'Servicios' || gasto.categoria === 'Varios') {
        gastosOperativos += valorUSD;
      }
    });

    const ingresosTotales = pedidos.reduce((sum, pedido) => sum + (pedido.total || 0), 0);

    let ingresosEfectivoUSD = 0;
    let ingresosEfectivoBs = 0;
    let ingresosDigital = 0;

    pedidos.forEach(pedido => {
      const monto = pedido.total || 0;
      if (pedido.metodoPago === 'Efectivo') {
        if (pedido.monedaPago === 'USD') ingresosEfectivoUSD += monto;
        else if (pedido.monedaPago === 'Bs') ingresosEfectivoBs += monto;
        else ingresosEfectivoBs += monto; // default si Efectivo pero sin moneda
      } else {
        ingresosDigital += monto;
      }
    });

    let gastosEfectivoUSD = 0;
    let gastosEfectivoBs = 0;
    let gastosDigitalCalculos = 0;

    gastos.forEach(gasto => {
      const valor = gasto.montoCalculadoUSD || gasto.monto || 0;
      if (gasto.metodoPago === 'Digital') {
        gastosDigitalCalculos += valor;
      } else if (gasto.metodoPago === 'Efectivo USD' || gasto.metodoPago === 'Efectivo') {
        gastosEfectivoUSD += valor;
      } else if (gasto.metodoPago === 'Efectivo Bs') {
        gastosEfectivoBs += valor;
      }
    });

    const caja = {
      efectivoUSD: ingresosEfectivoUSD - gastosEfectivoUSD,
      efectivoBs: ingresosEfectivoBs - gastosEfectivoBs,
      digital: ingresosDigital - gastosDigitalCalculos,
      totalGastos: totalGastos
    };

    const costosProduccion = pedidos.reduce((sum, pedido) => {
      const pedidoCapital = typeof pedido.costoTotalProduccion === 'number'
        ? pedido.costoTotalProduccion
        : Array.isArray(pedido.items)
          ? pedido.items.reduce((itemSum, item) => {
              const cantidad = Number(item.cantidad) || 0;
              const costo = Number(item.costoProduccion) || 0;
              return itemSum + costo * cantidad;
            }, 0)
          : 0;
      return sum + pedidoCapital;
    }, 0);

    const capitalReinversion = costosProduccion - gastosReinversion;
    const gananciaNeta = (ingresosTotales - costosProduccion) - gastosOperativos;
    const setting = await Setting.findOne();
    const metaSemanal = setting?.metaSemanal ?? 50;

    const pedidosDetalle = pedidos.map((pedido) => ({
      _id: pedido._id,
      fecha: pedido.createdAt,
      clienteNombre: pedido.clienteNombre,
      total: pedido.total,
    }));

    res.status(200).json({
      success: true,
      periodo: periodoParam,
      ingresosTotales,
      capitalReinversion,
      gananciaNeta,
      caja,
      metaSemanal,
      pedidos: pedidosDetalle,
    });
  } catch (error) {
    console.error('Error en getFinancialStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al obtener estadísticas financieras',
      error: error.message,
    });
  }
};

// ================= RECETAS =================

export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('productoAsociado', 'nombre precio costoProduccion').lean();
    res.status(200).json({
      success: true,
      data: recipes,
    });
  } catch (error) {
    console.error('Error en getRecipes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al obtener las recetas',
      error: error.message,
    });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const { 
      nombre, 
      rendimientoEstimado, 
      unidadesPorPaquete,
      tipoProductoAsociado,
      productoAsociado, 
      ingredientes,
      usaMelado,
      rendimientoMelado,
      meladoUsadoPorTanda
    } = req.body;
    
    if (!nombre || !rendimientoEstimado || !ingredientes) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios para la receta (nombre, rendimientoEstimado, ingredientes)',
      });
    }

    const nuevaReceta = await Recipe.create({
      nombre,
      rendimientoEstimado,
      unidadesPorPaquete: unidadesPorPaquete || 1,
      tipoProductoAsociado: tipoProductoAsociado || 'Paquete',
      usaMelado: usaMelado || false,
      rendimientoMelado: rendimientoMelado || 24,
      meladoUsadoPorTanda: meladoUsadoPorTanda || 6.8,
      productoAsociado,
      ingredientes
    });
    
    // Poblamos para regresar la data completa
    const recetaGuardada = await Recipe.findById(nuevaReceta._id).populate('productoAsociado', 'nombre precio costoProduccion').lean();

    res.status(201).json({
      success: true,
      data: recetaGuardada,
      message: 'Receta creada exitosamente'
    });
  } catch (error) {
    console.error('Error en createRecipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al crear la receta',
      error: error.message,
    });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      rendimientoEstimado, 
      unidadesPorPaquete,
      tipoProductoAsociado,
      productoAsociado, 
      ingredientes,
      usaMelado,
      rendimientoMelado,
      meladoUsadoPorTanda 
    } = req.body;

    const receta = await Recipe.findById(id);
    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada',
      });
    }

    if (nombre) receta.nombre = nombre;
    if (rendimientoEstimado !== undefined) receta.rendimientoEstimado = rendimientoEstimado;
    if (unidadesPorPaquete !== undefined) receta.unidadesPorPaquete = unidadesPorPaquete;
    if (tipoProductoAsociado !== undefined) receta.tipoProductoAsociado = tipoProductoAsociado;
    if (usaMelado !== undefined) receta.usaMelado = usaMelado;
    if (rendimientoMelado !== undefined) receta.rendimientoMelado = rendimientoMelado;
    if (meladoUsadoPorTanda !== undefined) receta.meladoUsadoPorTanda = meladoUsadoPorTanda;
    if (productoAsociado !== undefined) receta.productoAsociado = productoAsociado; // Puede venir nulo
    if (ingredientes) receta.ingredientes = ingredientes;

    await receta.save();

    // Poblamos para regresar la data completa
    const recetaActualizada = await Recipe.findById(id).populate('productoAsociado', 'nombre precio costoProduccion').lean();

    res.status(200).json({
      success: true,
      data: recetaActualizada,
      message: 'Receta actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en updateRecipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al actualizar la receta',
      error: error.message,
    });
  }
};

