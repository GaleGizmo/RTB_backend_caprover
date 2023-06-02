const Comentario=require('./comentario.model')

const deleteComentario = async (req, res, next) => {
    try {
      const { idComentario } = req.params;
      const userId = req.user._id;
      const deletedComentario = await Comentario.findByIdAndDelete(idComentario);
  
      if (!deletedComentario) {
          return res.status(404).json({ message: "Comentario no encontrado" });
        }
        if (deletedComentario.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "No tienes permiso para borrar este comentario" });
          }
      
      return res.status(200).json(deletedComentario);
    } catch (error) {
      return next(error);
    }
  };

  module.exports={deleteComentario}