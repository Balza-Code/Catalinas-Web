export async function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin'){
    next();
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado, solo para administradores'})
  }
}