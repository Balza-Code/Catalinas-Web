import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Función para generar un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: '1d'});
};

export async function registerUser(req, res) {
  const {nombre, email, password} = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist){
      return res.status(400).json({mensaje: 'El usuario ya existe '});
    }
    const user = await User.create({ nombre, email, password} );
    res.status(201).json({ token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor ', error });
  } 
};

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({ 
        token: generateToken(user._id),
        user: {
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          role: user.role
        }
       });
    } else {
      res.status(401).json({ mensaje: 'Credenciales invalidas' }) // 401 Unauthorized
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor ', error})
  }
};