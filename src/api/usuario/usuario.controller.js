const { generateSign } = require("../../utils/jwt");

const bcrypt = require("bcrypt");
const Usuario = require("./usuario.model");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Busca al usuario por  email
    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales erróneas" });
    }

    // Verifica la contraseña
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales erróneas" });
    }

    // Genera el token
    const token = generateSign(user._id, user.username);

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
};

const createUsuario = async (req, res, next) => {
  try {
    const { email, password, username, birthday, avatar } = req.body;

    // Comprueba campos obligatorios
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Por favor, complete todos los campos obligatorios" });
    }

    // Verifica si ya existe un usuario con el mismo email o username
    const existingEmailUser = await Usuario.findOne({ email });
if (existingEmailUser) {
  return res.status(400).json({ message: "Ese email ya está en uso" });
}

const existingUsernameUser = await Usuario.findOne({ username });
if (existingUsernameUser) {
  return res.status(400).json({ message: "Ese nombre de usuario no está disponible" });
}

    // Asigna role user si se intenta asignar admin

    if (req.body.role === 2) {
      req.body.role = 1;
    }

    // Crea el nuevo usuario 
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usuario({
      email,
      password: hashedPassword,
      username,
      role,
      birthday,
      avatar,
    });

    const savedUser = await newUser.save();

    // Genera el token 
    const token = generateSign(savedUser._id, savedUser.username);

    return res.status(201).json({ token });
  } catch (error) {
    return next(error);
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;

    const deletedUsuario = await Usuario.findByIdAndDelete(idUsuario);

    if (!deletedUsuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(deletedUsuario);
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, createUsuario, deleteUsuario };
