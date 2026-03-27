export async function adminOnly(req, res, next) {
  console.log("Usuario en adminOnly:", req.user);
  if (req.user && req.user.role === 'admin'){
    next();
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado, solo para administradores'})
  }
}