import Order from '../models/order.js';
import User from '../models/user.js';

export const getAdminClientesResume = async (req, res) => {
  try {
    const clientesResume = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $group: {
          _id: '$user',
          nombre: { $first: '$userInfo.nombre' },
          email: { $first: '$userInfo.email' },
          totalPedidos: { $sum: 1 },
          montoTotalGastado: { $sum: '$total' },
          saldoDeudor: { $sum: { $subtract: ['$total', '$pagado'] } }
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          nombre: 1,
          email: 1,
          totalPedidos: 1,
          montoTotalGastado: 1,
          saldoDeudor: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: clientesResume
    });
  } catch (error) {
    console.error('Error en getAdminClientesResume:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};