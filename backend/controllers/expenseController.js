import Expense from '../models/Expense.js';

export const createExpense = async (req, res) => {
  try {
    const { monto, moneda, categoria, descripcion, tasaCambio, metodoPago } = req.body;

    // Validación básica de los datos de entrada
    if (!monto || !moneda || !categoria) {
      return res.status(400).json({ mensaje: 'Por favor proporcione monto, moneda y categoría' });
    }

    let tasa = 1;
    let montoUSD = Number(monto);

    if (moneda === 'Bs') {
      tasa = Number(tasaCambio) || 1;
      montoUSD = Number(monto) / tasa;
    }

    const newExpense = new Expense({
      monto,
      tasaCambio: tasa,
      montoCalculadoUSD: montoUSD,
      moneda,
      metodoPago: metodoPago || 'Efectivo',
      categoria,
      descripcion
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({ mensaje: 'Error al crear el gasto', error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    // Ordenar los gastos de más reciente a más antiguo (descendente por fecha)
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los gastos', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }

    await expense.deleteOne();
    res.status(200).json({ mensaje: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el gasto', error: error.message });
  }
};
