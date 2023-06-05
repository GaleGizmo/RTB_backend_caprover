const Comentario=require('./comentario.model')

const getAllComentarios = async (req, res, next) => {
  try {
    const comentarios = await Comentario.find();
    return res.status(200).json(comentarios);
  } catch (error) {
    return next(error);
  }
};


const getComentariosByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const comentarios = await Comentario.findOne({ user: userId });
    return res.status(200).json(comentarios);
  } catch (error) {
    return next(error);
  }
};

const getComentariosByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const comentarios = await Comentario.find({ event: eventId });
    return res.status(200).json(comentarios);
  } catch (error) {
    return next(error);
  }
};
const createComentario = async (req, res, next) => {
  try {
    const { user, event, title, content, value } = req.body;

    if (
      !user ||
      !event ||
      !title
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevoComentario = new Comentario({
      user,
      event,
      title,
      content,
      value
    });

    const comentarioCreado = await nuevoComentario.save();
    return res.status(201).json(comentarioCreado);
  } catch (error) {
    return next(error);
  }
};

const editComentario = async (req, res, next) => {
  try {
    const { idComentario } = req.params;
    const userId = req.user._id;
    const { title, content, value } = req.body;

    const comentario = await Comentario.findById(idComentario);

    if (!comentario) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comentario.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "No tienes permiso para editar este comentario" });
    }

    comentario.title = title;
    comentario.content = content;
    comentario.value = value;

    const comentarioActualizado = await comentario.save();
    return res.status(200).json(comentarioActualizado);
  } catch (error) {
    return next(error);
  }
};

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

  module.exports={getAllComentarios, getComentariosByUser, getComentariosByEvent, editComentario, createComentario, deleteComentario}