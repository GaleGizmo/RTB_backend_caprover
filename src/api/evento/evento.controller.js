const { checkMandatoryFields } = require("../../middleware/checkfields");
const { deleteImg } = require("../../middleware/deleteImg");
const {enviarCorreoElectronico, enviarCorreoSemanal} = require("../../utils/email");

const User = require("../usuario/usuario.model");
const Evento = require("./evento.model");

//recoge todos los eventos de la BBDD
const getAllEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.find();

    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};

//manda por mail eventos de la semana
const sendEventosSemanales = async (req, res, next) => {
  const hoy = new Date();
  
  //obtenemos la fecha de inicio de la semana y de fin de la semana
  const fechaInicioSemana = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate() 
  );
  const fechaFinSemana = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate() + (6 )
  );

  try {
    const eventosSemana = await Evento.find({
      date_start: { $gte: fechaInicioSemana, $lte: fechaFinSemana },
    }).sort({ date_start: 1 });

    const usuarios = await User.find({ newsletter: true }, "email username");

    for (const usuario of usuarios) {
      await enviarCorreoSemanal(usuario, eventosSemana);
    }
    return res.status(200).json({ message: "Eventos enviados con éxito" });
  } catch (error) {
    console.error("Error al obtener eventos semanales:", error);
  }
};
// sendEventosSemanales()
//Recogemos un evento por id
const getEventoById = async (req, res, next) => {
  try {
    const { idEvento } = req.params;
    const evento = await Evento.findById(idEvento);
    return res.status(200).json(evento);
  } catch (error) {
    return next(error);
  }
};
//añade un evento a la BBDD
const setEvento = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      content,
      user_creator,
      site,
      price,
      buy_ticket,
      date_start,
      date_end,
      url,
      image,
      youtubeVideoId,
      genre,
    } = req.body;

    const timestamp = new Date();
    const newEvento = new Evento({
      title,
      subtitle,
      content,
      user_creator,
      site,
      price,
      buy_ticket,
      date_start,
      date_end,
      url,
      image,
      youtubeVideoId,
      genre,
      timestamp,
    });
    if (req.file) {
      newEvento.image = req.file.path;
    }
    await newEvento.save();
    const usuarios = await User.find(
      { newevent: true },
      "email username"
    ).lean();

    for (const usuario of usuarios) {
      await enviarCorreoElectronico(usuario, newEvento);
    }

    return res.status(200).json({ message: "Evento creado con éxito" });
  } catch (error) {
    return next(error);
  }
};

//borra un evento de la BBDD
const deleteEvento = async (req, res, next) => {
  try {
    const { idEvento } = req.params;

    const deletedEvento = await Evento.findByIdAndDelete(idEvento);

    if (!deletedEvento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    return res.status(200).json(deletedEvento);
  } catch (error) {
    if (error.name === "ValidationError") {
      // Manejo de errores de validación
      return res
        .status(400)
        .json({ message: "Error de validación", error: error.message });
    } else if (error.name === "MongoError" && error.code === 11000) {
      // Manejo de errores de duplicados (si se tiene un índice único en el modelo)
      return res
        .status(400)
        .json({ message: "Error de duplicado", error: error.message });
    } else if (error.name === "CastError" && error.kind === "ObjectId") {
      // Manejo de errores de ID inválido
      return res.status(400).json({ message: "ID de evento inválido" });
    } else {
      // Manejo de otros errores de la base de datos
      return res
        .status(500)
        .json({ message: "Error de base de datos", error: error.message });
    }
  }
};

//actualiza un evento de la BBDD
const updateEvento = async (req, res, next) => {
  try {
    // if (!req.body.title || !req.body.subtitle  || !req.body.content || !req.body.site || !req.body.date_start){
    //   return res.status(400).json({message: "Faltan campos obligatorios"});
    // }

    const { idEvento } = req.params;
    if (req.file) {
      const oldEvento = await Evento.findById(idEvento);
      if (oldEvento.image) {
        deleteImg(oldEvento.image);
      }
      req.body.image = req.file.path;
    }

    let eventoToUpdate = await Evento.findById(idEvento);
    if (!eventoToUpdate) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    eventoToUpdate = new Evento(req.body);

    eventoToUpdate._id = idEvento;

    const updatedEvento = await Evento.findByIdAndUpdate(
      idEvento,
      eventoToUpdate,
      { new: true }
    );

    return res.status(200).json(updatedEvento);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllEventos,
  sendEventosSemanales,
  getEventoById,
  setEvento,
  updateEvento,
  deleteEvento,
};
