const Usuario = require('./usuario.model')

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

  module.exports = {deleteUsuario}