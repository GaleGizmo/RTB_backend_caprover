const { checkMandatoryFields } = require("../../middleware/checkfields");
const { deleteImg } = require("../../middleware/deleteImg");
const {
  enviarCorreo,
  

  enviarReminderEventos,
} = require("../../utils/email");

const User = require("../usuario/usuario.model");
const Evento = require("./evento.model");

//recoge todos los eventos de la BBDD
const getAllEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.find();
    eventos.sort((a, b) => a.date_start - b.date_start);
    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};

//recoge solo eventos desde fecha actual
const getEventosDesdeHoy = async (req, res, next) => {
  try {
    const hoy = new Date();
    
    const eventos = await Evento.find({ date_start: { $gte: hoy } });

    eventos.sort((a, b) => a.date_start - b.date_start);

    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};

const getEventosParaCalendar = async (req, res, next) => {
  try {
    const eventos = await Evento.find({}, '_id title date_start');

    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};

const getEventosEntreFechas = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    
    const eventos = await Evento.find({
      date_start: {
        $gte: startDate,
        $lte: endDate
      }
    });
    eventos.sort((a, b) => a.date_start - b.date_start);
   
    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};

const getEventosProximosFavoritos = async () => {
  const fechaActual = new Date();
  const fechaUnaSemana = new Date();
  const fechaManana = new Date();

  fechaUnaSemana.setDate(fechaActual.getDate() + 6);
  fechaUnaSemana.setHours(0, 0, 0, 0);

  fechaManana.setDate(fechaActual.getDate() + 1);
  fechaManana.setHours(0, 0, 0, 0);

  const eventosProximos = await Evento.find({
    $or: [
      {
        date_start: {
          $gte: fechaManana,
          $lt: new Date(fechaManana.getTime() + 24 * 60 * 60 * 1000),
        },
      }, // Eventos que ocurran mañana
      {
        date_start: {
          $gte: fechaUnaSemana,
          $lt: new Date(fechaUnaSemana.getTime() + 24 * 60 * 60 * 1000),
        },
      }, // Eventos que ocurran en una semana
    ],
  });
  const eventosProximosActivos=eventosProximos.filter(evento=>evento.status !=='cancelled')
  return eventosProximosActivos;
};


const remindEvento = async () => {
  try {
    const eventosProximos = await getEventosProximosFavoritos();

    if (eventosProximos.length > 0) {
      const usuariosConEventoEnFavoritos = await User.find({
        favorites: { $in: eventosProximos.map((evento) => evento._id) },
      });

      if (usuariosConEventoEnFavoritos.length > 0) {
        for (const usuario of usuariosConEventoEnFavoritos) {
          for (const evento of eventosProximos) {
            await enviarReminderEventos(evento, usuario);
          }
        }
        console.log("Recordatorios de eventos enviados con éxito");
      } else {
        console.log("No hay usuarios con eventos en favoritos");
      }
    } else {
      console.log("No hay eventos próximos");
    }
  } catch (error) {
    console.error("Error al enviar los recordatorios de eventos:", error);
  }
};

const remindEventosHandler = async (req, res) => {
  try {
    await remindEvento();
    res
      .status(200)
      .send({ message: "Recordatorios de eventos enviados con éxito" });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Error al enviar los recordatorios de eventos:" });
  }
};

const getEventosAEnviar = async (fechaInicio, fechaFin, field) => {
  const query = {};
  query[field] = { $gte: fechaInicio, $lt: fechaFin };

  const eventos= await Evento.find(query).sort({ date_start: 1 });
  const eventosActivos= eventos.filter(evento=>evento.status !=='cancelled')
  return eventosActivos
};

const sendCorreos = async (usuarios, eventos, tipoCorreo) => {
  
  await Promise.all(
    usuarios.map((usuario) => enviarCorreo(usuario, eventos, tipoCorreo))
  );
};

//manda por mail eventos de la semana
const sendEventosSemanales = async () => {
  try {
    const hoy = new Date();
    const semanal = true;
    //obtenemos la fecha de inicio de la semana y de fin de la semana
    const fechaInicio = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );
    const fechaFin = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() + 6
    );
    //busca eventos en esa semana
    const eventosSemana = await getEventosAEnviar(
      fechaInicio,
      fechaFin,
      "date_start"
    );
    //busca usuarios que reciben la newsletter
    const usuarios = await User.find({ newsletter: true }, "email username");
    //envía los correos a los usuarios
    await sendCorreos(usuarios, eventosSemana, semanal);
    console.log({ message: "Eventos semanales enviados con éxito" });
  } catch (error) {
    console.error("Error al enviar eventos semanales:", error.message);
  }
};

const sendEventosSemanalesHandler = async (req, res) => {
  try {
    await sendEventosSemanales();
    res.status(200).send({ message: "Eventos enviados con éxito" });
  } catch (error) {
    res.status(500).send({ error: "Error al enviar eventos semanales" });
  }
};
const sendEventosDiarios = async () => {
  try {
    const hoy = new Date();
    const semanal = false;
    const fechaInicio = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()-1,
      14,
      0,
      0
    );
    const fechaFin = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      14,
      0,
      0
    );

    const eventosDia = await getEventosAEnviar(
      fechaInicio,
      fechaFin,
      "createdAt"
    );
    if (eventosDia && eventosDia.length > 0) {
      const usuarios = await User.find(
        { newevent: true },
        "email username"
      ).lean();
      await sendCorreos(usuarios, eventosDia, semanal);
      console.log({ message: "Eventos añadidos hoy enviados con éxito" });
    } else {
      console.log({ message: "No se han añadido eventos hoy" });
    }
  } catch (error) {
    console.error("Error al enviar eventos de hoy:", error.message);
  }
};
const sendEventosDiariosHandler = async (req, res) => {
  try {
    await sendEventosDiarios();
    res.status(200).send({ message: "Eventos de hoy enviados con éxito" });
  } catch (error) {
    res.status(500).send({ error: "Error al enviar eventos de hoy" });
  }
};

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
      artist,
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
      artist,
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
      // Manejo de errores de duplicados
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
    // if (!req.body.title || !req.body.artist  || !req.body.content || !req.body.site || !req.body.date_start){
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
  getEventosDesdeHoy,
  getEventosEntreFechas,
  getEventosParaCalendar,
  sendEventosSemanales,
  getEventoById,
  setEvento,
  updateEvento,
  deleteEvento,
  remindEvento,
  sendEventosSemanalesHandler,
  remindEventosHandler,
  sendEventosDiarios,
  sendEventosDiariosHandler,
};
