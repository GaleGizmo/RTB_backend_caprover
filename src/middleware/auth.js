const User = require("../api/usuario/usuario.model");
const { verifyJwt } = require("../utils/jwt");
const Comentario = require("../api/comentario/comentario.model");

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Debes estar logueado, chaval" });
    }
    const parsedToken = token.replace("Bearer ", "");

    const validToken = verifyJwt(parsedToken);
    const userLogued = await User.findById(validToken.id).select("-password");
    if (!userLogued) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    req.user = userLogued;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Debes estar logueado, chaval" });
    }
    const parsedToken = token.replace("Bearer ", "");

    const validToken = verifyJwt(parsedToken);
    const userLogued = await User.findById(validToken.id);

    if (userLogued.role === 2) {
      userLogued.password = null;
      req.user = userLogued;
      next();
    } else return res.status(403).json({error: "No estás autorizado para esta función, chavalote"});
  } catch (error) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

const isAdminOrOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Debes estar logueado, chaval" });
    }

    const parsedToken = token.replace("Bearer ", "");
    const validToken = verifyJwt(parsedToken);
    const userLogued = await User.findById(validToken.id);
    const { idUsuario } = req.params;

    // Comprueba si el usuario logueado es un admin o el propietario
    if (userLogued.role === 2 || userLogued.id === idUsuario) {
      userLogued.password = null;
      req.user = userLogued;
      next();
    } else {
      return res
        .status(403)
        .json("No estás autorizado para esta función, chavalote");
    }
  } catch (error) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

const isAdminOrComentarioOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Debes estar logueado, chaval" });
    }

    const parsedToken = token.replace("Bearer ", "");
    const validToken = verifyJwt(parsedToken);
    const userLogued = await User.findById(validToken.id);
    const { idComentario } = req.params;
    const comentario = await Comentario.findById(idComentario);

    // Comprueba si el usuario logueado es un admin o el propietario
    if (
      userLogued.role === 2 ||
      comentario.user.toString() === userLogued.id.toString()
    ) {
      userLogued.password = null;
      req.user = userLogued;
      next();
    } else {
      return res
        .status(403)
        .json("No estás autorizado para esta función, chavalote");
    }
  } catch (error) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
module.exports = { isAuth, isAdmin, isAdminOrOwner, isAdminOrComentarioOwner };
