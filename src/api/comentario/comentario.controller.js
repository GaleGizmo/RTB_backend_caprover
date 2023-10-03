const Evento = require("../evento/evento.model");
const Comentario = require("./comentario.model");

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
    const comentarios = await Comentario.find({ user: userId }).sort({createdAt: -1});
    if (!comentarios || comentarios.length === 0) {
      return res.status(404).json({ message: "No se encontraron comentarios para este usuario." });
    }
    return res.status(200).json(comentarios);
  } catch (error) {
    return next(error);
  }
};

const getComentariosByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const comentarios = await Comentario.find({ event: eventId }).populate(
      "user"
    );
    return res.status(200).json(comentarios);
  } catch (error) {
    return next(error);
  }
};
const createComentario = async (req, res, next) => {
  try {
    const { user, event, title, content, value } = req.body;

    if (!user || !event || !title) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevoComentario = new Comentario({
      user,
      event,
      title,
      content,
      value,
    });

    const comentarioCreado = await nuevoComentario.save();
    await Evento.findByIdAndUpdate(
      event, // ID del evento al que pertenece el comentario
      { $inc: { commentsCount: 1 } }, // Incrementar commentsCount en 1
      { new: true } // Devolver el evento actualizado
    );
    return res.status(201).json(comentarioCreado);
  } catch (error) {
    return next(error);
  }
};

const editComentario = async (req, res, next) => {
  try {
    const { idComentario } = req.params;

    const { title, content, value } = req.body;

    const comentarioToUpdate = await Comentario.findById(idComentario);

    if (!comentarioToUpdate) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (!title) {
      return res.status(404).json({ message: "Debes poner algo en el título" });
    } else {
      comentarioToUpdate.title = title;
    }
    if (content) comentarioToUpdate.content = content;
    if (value) comentarioToUpdate.value = value;

    const updatedComentario = await comentarioToUpdate.save();
    return res.status(200).json(updatedComentario);
  } catch (error) {
    return next(error);
  }
};

const deleteComentario = async (req, res, next) => {
  try {
    const { idComentario } = req.params;
    const userId = req.user._id;
    const deletedComentario = await Comentario.findById(idComentario);

    if (!deletedComentario) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }
    if (deletedComentario.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para esta acción" });
    }
    await Comentario.findByIdAndDelete(idComentario);

    // Actualizar commentsCount en el evento correspondiente
    await Evento.findByIdAndUpdate(
      deletedComentario.event, 
      { $inc: { commentsCount: -1 } }, 
      { new: true } 
    );
    return res.status(200).json(deletedComentario);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllComentarios,
  getComentariosByUser,
  getComentariosByEvent,
  editComentario,
  createComentario,
  deleteComentario,
};
