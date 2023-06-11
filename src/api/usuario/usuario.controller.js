const { generateSign } = require("../../utils/jwt");

const bcrypt = require("bcrypt");
const Usuario = require("./usuario.model");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Busca al usuario por  username
    const user = await Usuario.findOne({ username });
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
    const { email, password, username, birthday, avatar } = req.body;

    // Comprueba campos obligatorios
    // if (!email || !password || !username) {
    //   return res
    //     .status(400)
    //     .json({ message: "Faltan campos obligatorios" });
    // }

    // Verifica si ya existe un usuario con el mismo email o username
    const existingEmailUser = await Usuario.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ message: "Este email ya está en uso" });
    }

    const existingUsernameUser = await Usuario.findOne({ username });
    if (existingUsernameUser) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario no disponible" });
    }

    // Asigna role user si se intenta asignar admin

    // Crea el nuevo usuario
    const role = 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usuario({
      email,
      password: hashedPassword,
      username,
      role,
      birthday,
      avatar,
    });
    if (req.file) {
      newUser.avatar = req.file.path;
    }
    const savedUser = await newUser.save();

    // Genera el token
    const token = generateSign(savedUser._id, savedUser.username, savedUser.role);

    return res.status(201).json({ token, user:savedUser });
  } catch (error) {
    return next(error);
  }
};

const editUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    
    const { email, password, username, birthday, avatar } = req.body;

    // Busca al usuario por su ID
    const userToUpdate = await Usuario.findById(idUsuario);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

   
    // Actualiza los datos del usuario si es procedente
   
    if (email) userToUpdate.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userToUpdate.password = hashedPassword;
    }
    
   
    if (username) userToUpdate.username = username;
    if (birthday) userToUpdate.birthday = birthday;
    if (avatar) userToUpdate.avatar = avatar;

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
      return res.status(200).json(usuarioToDelete);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, createUsuario, editUsuario, deleteUsuario };
