const { generateSign } = require("../../utils/jwt");

const bcrypt = require("bcrypt");
const Usuario = require("./usuario.model");
const { deleteImg } = require("../../middleware/deleteImg");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Busca al usuario por  username
    const user = await Usuario.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciales erróneas" });
    }

    // Verifica la contraseña
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales erróneas" });
    }

    // Genera el token
    const token = generateSign(user._id, user.username, user.role);
    user.password = null;
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

const createUsuario = async (req, res, next) => {
  try {
    console.log(req.body);

    // Verifica si ya existe un usuario con el mismo email o username
    if (!req.body.email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }
    const existingEmailUser = await Usuario.findOne({ email: req.body.email });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Este email ya está en uso" });
    }
    if (!req.body.username) {
      return res.status(400).json({ message: "El usuario es obligatorio" });
    }
    const existingUsernameUser = await Usuario.findOne({
      username: req.body.username,
    });
    if (existingUsernameUser) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario no disponible" });
    }

    // Asigna role user si se intenta asignar admin
    const role = 1;
    // Crea el nuevo usuario

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new Usuario({
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
      role: role,
      birthday: req.body.birthday,
      newsletter: req.body.newsletter,
      newevent: req.body.newevent,
    });
    if (req.file) {
      newUser.avatar = req.file.path;
    }
    const savedUser = await newUser.save();

    // Genera el token
    const token = generateSign(
      savedUser._id,
      savedUser.username,
      savedUser.role
    );

    return res.status(201).json({ token, user: savedUser });
  } catch (error) {
    return next(error);
  }
};

const editUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;

    const { email, password, username, newsletter, newevent, avatar } =
      req.body;

    // Busca al usuario por su ID
    const userToUpdate = await Usuario.findById(idUsuario);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const existingEmailUser = await Usuario.findOne({ email: email });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Este email ya está en uso" });
    }
    const existingUsernameUser = await Usuario.findOne({
      username: username,
    });
    if (existingUsernameUser) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario no disponible" });
    }
    // Actualiza los datos del usuario si es procedente

    if (email) userToUpdate.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userToUpdate.password = hashedPassword;
    }

    if (username) userToUpdate.username = username;
    if (newsletter) userToUpdate.newsletter = newsletter;
    if (newevent) userToUpdate.newevent = newevent;
    if (req.file) {
      const oldUsuario = await Usuario.findById(idUsuario);
      if (oldUsuario.avatar) {
        deleteImg(oldUsuario.avatar);
      }
      userToUpdate.avatar = req.file.path;
    }

    // Guarda los cambios en la base de datos
    const updatedUser = await userToUpdate.save();

    // Responde con el usuario modificado
    return res.status(200).json(updatedUser);
  } catch (error) {
    return next(error);
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const usuarioToDelete = await Usuario.findByIdAndDelete(idUsuario);
    if (!usuarioToDelete) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      if (usuarioToDelete.avatar) {
        deleteImg(usuarioToDelete.avatar);
      }
      return res.status(200).json(usuarioToDelete);
    }
  } catch (error) {
    return next(error);
  }
};
const forgotPassword = async (req, res, next) => {
  try {
    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const token = generateSign();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token válido por 1 hora
    await user.save();
    await enviarCorreoRecuperacion(user, token);
    res
      .status(200)
      .json({
        message:
          "Se ha enviado un correo electrónico de recuperación de contraseña",
      });
  } catch (error) {
    console.error(
      "Error al procesar la solicitud de recuperación de contraseña:",
      error
    );
    res
      .status(500)
      .json({
        message: "Error al procesar la solicitud de recuperación de contraseña",
      });
  }
};
module.exports = { login, createUsuario, editUsuario, deleteUsuario };
