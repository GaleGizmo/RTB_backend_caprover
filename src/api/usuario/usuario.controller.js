const { generateSign, generateTempToken } = require("../../utils/jwt");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./usuario.model");
const { deleteImg } = require("../../middleware/deleteImg");
const { enviarCorreoRecuperacion } = require("../../utils/email");
const Evento = require("../evento/evento.model");
const Comentario = require("../comentario/comentario.model")

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Busca al usuario por  username
    const user = await Usuario.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais erróneas" });
    }

    // Verifica la contraseña
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais erróneas" });
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
    

    // Verifica si ya existe un usuario con el mismo email o username
    if (!req.body.email) {
      return res.status(400).json({ message: "O email é obligatorio" });
    }
    const existingEmailUser = await Usuario.findOne({ email: req.body.email });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Este email xa está en uso" });
    }
    if (!req.body.username) {
      return res.status(400).json({ message: "O usuario é obligatorio" });
    }
    const existingUsernameUser = await Usuario.findOne({
      username: req.body.username,
    });
    if (existingUsernameUser) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario non dispoñible" });
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

    const { email, username, newsletter, newevent, avatar } =
      req.body;

    // Busca al usuario por su ID
    const userToUpdate = await Usuario.findById(idUsuario);
    if (!userToUpdate) {
      console.log("usuario non existe")
      return res.status(404).json({ message: "Usuario non atopado" });
    }
    const existingEmailUser = await Usuario.findOne({ email: email });
    if (existingEmailUser && existingEmailUser._id != idUsuario) {
      console.error("Este email está en uso")
      return res.status(400).json({ message: "Este email xa está en uso" });
    }
    const existingUsernameUser = await Usuario.findOne({
      username: username,
    });
    if (existingUsernameUser && existingUsernameUser._id != idUsuario) {
      console.error("Este usuario xa está ocupado")
      return res
        .status(400)
        .json({ message: "Nombre de usuario non dispoñible" });
    }
    // Actualiza los datos del usuario si es procedente

    userToUpdate.email = email;

    userToUpdate.username = username;
    userToUpdate.newsletter = newsletter;
    userToUpdate.newevent = newevent;
    if (req.file) {
      const oldUsuario = await Usuario.findById(idUsuario);
      if (oldUsuario.avatar) {
        deleteImg(oldUsuario.avatar);
      }
      userToUpdate.avatar = req.file.path;
    } else {
      if ( avatar) {userToUpdate.avatar=avatar

      }
      // Si no se proporciona un nuevo avatar, elimina el avatar existente
     else {if (userToUpdate.avatar) {
        deleteImg(userToUpdate.avatar);
        userToUpdate.avatar = null;
      }}
    }

    // Guarda los cambios en la base de datos
    const updatedUser = await userToUpdate.save();

    // Responde con el usuario modificado
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUsuario = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { idUsuario } = req.params;
    
    // Eliminar comentarios del usuario
    await Comentario.deleteMany({ user: idUsuario }, { session });

    // Eliminar usuario
    const usuarioToDelete = await Usuario.findByIdAndDelete(idUsuario, { session });
    
    if (!usuarioToDelete) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Usuario non atopado" });
    } else {
      if (usuarioToDelete.avatar) {
        deleteImg(usuarioToDelete.avatar);
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(usuarioToDelete);
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario non atopado" });
    }
    const token = generateTempToken(user._id);
    console.log(token, user);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token válido por 1 hora
    await user.save();
    await enviarCorreoRecuperacion(user, token);
    res.status(200).json({
      token,
      message:
        "Enviouse un email de recuperación de contrasinal",
    });
  } catch (error) {
    console.error(
      "Erro ao procesar a solicitude de recuperación de contrasinal:",
      error
    );
    res.status(500).json({
      message: "Erro ao procesar a solicitude de recuperación de contrasinal",
    });
  }
};
const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    // Buscar al usuario por el token de recuperación de contraseña
    const user = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    // Actualizar la contraseña del usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Contrasinal restablecido exitosamente" });
  } catch (error) {
    console.error("Erro ao restablecer o contrasinal:", error);
    res.status(500).json({ message: "Erro ao restablecer o contrasinal" });
  }
};
const unsubscribe = async (req, res, next) => {
  const { email, unsubscribe } = req.body;
  const { idUsuario } = req.params;

  try {
    const user = await Usuario.findOne({ email: email });
   
    if (!user) {
      return res.status(404).json({ message: "Usuario non atopado" });
    }
    if (user && user._id.toString()!==idUsuario){
      return res.status(400).json({ message: "Non estás autorizado" })
    }
    else user[unsubscribe]=false;

    await user.save();
    res.status(200).json({ user, message: "Axustes de suscripción cambiados" });
  } catch (error) {
    console.error("Erro ao cancelar a suscripción:", error);
    res.status(500).json({ message: "Erro ao cambiar a suscripción" });
  }
};

const addFavorite=async(req, res, next)=>{
  const {userId, eventId, add}=req.body
  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario non atopado" });
    }
    const evento = await Evento.findById(eventId);
    if (!evento) {
      return res.status(404).json({ message: "Evento non atopado" });
    }
    if (add) {usuario.favorites.push(eventId);}
    else {usuario.favorites.pull(eventId);}
    
    await usuario.save();
    

    res.json({
      message: add ? " Evento engadido correctamente": "Evento eliminado correctamente", 
      
    });
  } catch (error) {
    
    res.status(500).json({ message: "Erro ao modificar favoritos" });
  }

}
const sendUserMessage = async (req, res, next) => {
  const { name, email, type, content, user } = req.body;

  try {
    
    await enviarMensajeDeUsuario(type, name, email, content);
   
 

    res.status(200).json({ message: "Mensaxe enviada correctamente" });
  } catch (error) {
   return next(error);
  }
};
module.exports = {
  login,
  createUsuario,
  editUsuario,
  forgotPassword,
  deleteUsuario,
  resetPassword,
  unsubscribe,
  addFavorite,
  sendUserMessage
};
