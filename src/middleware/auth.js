const User = require("../api/usuario/usuario.model");
const { verifyJwt } = require("../utils/jwt");
const Comentario = require("../api/comentario/comentario.model");


const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Debes estar logueado, rapaz" });
  }
  const parsedToken = token.replace("Bearer ", "");
  try {
    const validToken = await verifyJwt(parsedToken);
    const userLogued = await User.findById(validToken.id).select("-password");
    if (!userLogued) {
      return res.status(401).json({ message: "Usuario non atopado" });
    }
    req.user = userLogued;
    next();
  } catch (err) {
    next(err); // Pasar el error al siguiente middleware
  }
};

const isAdmin = [authenticate, (req, res, next) => {
  if (req.user.role === 2) {
    next();
  } else {
    return res.status(403).json({message: "Non estás autorizado para esta función"});
  }
}];

const isAdminOrOwner = [authenticate, (req, res, next) => {
  const { idUsuario } = req.params;
  if (req.user.role === 2 || req.user.id === idUsuario) {
    next();
  } else {
    return res.status(403).json({message: "Non estás autorizado para esta función"});
  }
}];

const isAdminOrComentarioOwner = [authenticate, async (req, res, next) => {
  const { idComentario } = req.params;
  const comentario = await Comentario.findById(idComentario);
  if (!comentario) {
    return res.status(401).json({ message: "Comentario non atopado" });
  }
  if (req.user.role === 2 || comentario.user.toString() === req.user.id.toString()) {
    next();
  } else {
    return res.status(403).json({message: "Non estás autorizado para esta función"});
  }
}];

module.exports = {
  authenticate,
  isAdmin,
  isAdminOrOwner,
  isAdminOrComentarioOwner,
};

