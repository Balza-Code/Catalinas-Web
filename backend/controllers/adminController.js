import Order from '../models/order.js';
import User from '../models/user.js';
import Setting from '../models/Setting.js';

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
    } else {
      startDate = getMonday(today);
    }

    const pedidos = await Order.find({
      estado: 'Pago Completado',
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

 

    const ingresosTotales = pedidos.reduce((sum, pedido) => sum + (pedido.total || 0), 0);

    const capitalReinversion = pedidos.reduce((sum, pedido) => {
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

    const gananciaNeta = ingresosTotales - capitalReinversion;
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
