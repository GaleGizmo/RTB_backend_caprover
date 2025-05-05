const { checkMandatoryFields } = require("../../middleware/checkfields");
const { deleteImg } = require("../../middleware/deleteImg");
const {
  enviarCorreoEventos,
  enviarCorreccionEvento,
  enviarReminderEventos,
} = require("../../utils/email");

const User = require("../usuario/usuario.model");
const Evento = require("./evento.model");
const { nanoid } = require("nanoid");

//recoge todos los eventos de la BBDD
const getAllEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.find({ status: { $ne: "draft" } });
    eventos.sort((a, b) => a.date_start - b.date_start);
    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};
const getDraftEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.find({ status: "draft" });
    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};
//recoge solo eventos desde fecha actual
const getEventosDesdeHoy = async (req, res, next) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const eventos = await Evento.find({
      date_start: { $gte: hoy },
      status: { $ne: "draft" },
    });

    eventos.sort((a, b) => {
      if (a.highlighted && !b.highlighted) return -1;
      if (!a.highlighted && b.highlighted) return 1;
      return a.date_start - b.date_start;
    });

    return res.json(eventos);
  } catch (error) {
    return next(error);
  }
};

const getEventosParaCalendar = async (req, res, next) => {
  try {
    const eventos = await Evento.find(
      { status: { $ne: "draft" } },
      "_id title date_start"
    );

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
        $lte: endDate,
      },
      status: { $ne: "draft" },
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
    status: { $nin: ["cancelled", "draft"] }, //descarta los que se hayan cancelado y los borradores
  });
  return eventosProximos;
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
            if (usuario.favorites && usuario.favorites.includes(evento._id)) {
              await enviarReminderEventos(evento, usuario);
            }
          }
        }
        console.log("Recordatorios de eventos enviados con éxito");
      } else {
        console.log("No hay usuarios con eventos en favoritos");
        return;
      }
    } else {
      console.log("No hay eventos próximos");
      return;
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
  try {
    const query = {};
    query[field] = { $gte: fechaInicio, $lt: fechaFin };
    const eventosExcluidos = ["cancelled", "soldout", "draft"];
    const eventos = await Evento.find(query).sort({ date_start: 1 });
    //Evita mandar en los eventos diarios los que se añadieran y tuvieran lugar el día anterior
    if (field === "createdAt") {
      const eventosExceptoLosDeAyer = eventos.filter(
        (evento) => evento.date_start > fechaFin && !eventosExcluidos.includes(evento.status)
      );
     
      return eventosExceptoLosDeAyer;
    }
    
    const eventosActivos = eventos.filter(
      (evento) => !eventosExcluidos.includes(evento.status)
    );
    
    return eventosActivos;
  } catch (error) {
    return { status: 500, message: "Error ao obter eventos a mandar" };
  }
};

const sendCorreos = async (usuarios, eventos, tipoCorreo) => {
  for (const usuario of usuarios) {
    await enviarCorreoEventos(usuario, eventos, tipoCorreo);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar 1 segundo entre cada envío
  }
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
    fechaFin.setHours(23, 59, 59, 999);
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
const sendEventosDiarios = async (req, res, next) => {
  try {
    const hoy = new Date();
    const semanal = false;
    const fechaInicio = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() - 1,
      15,
      0,
      0
    );
    const fechaFin = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      15,
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
      return res.status(200).send({ message: "Eventos de hoxe enviados" });
    } else {
      return res.status(200).send({ message: "No se engadiron eventos" });
    }
  } catch (error) {
    error.message = "Erro ao mandar eventos diarios";
    return next(error);
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
async function generateUniqueShortUrl() {
  let unique = false;
  let shortUrl;

  while (!unique) {
    shortUrl = nanoid(4);
    const existingEvent = await Evento.findOne({ shortURL: shortUrl });
    if (!existingEvent) {
      unique = true;
    }
  }

  return shortUrl;
}

//Recogemos un evento por id
const getEventoById = async (req, res, next) => {
  try {
    const { idEvento } = req.params;
    let evento;
    if (idEvento.length === 4) {
      // Verifica si el parámetro es un shortURL
      evento = await Evento.findOne({ shortURL: idEvento });
    } else {
      // Si no, asume que es un evento_id
      evento = await Evento.findById(idEvento);
    }
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
      payWhatYouWant,
      price,
      buy_ticket,
      date_start,
      date_end,
      url,
      image,
      youtubeVideoId,
      genre,
      status,
      highlighted,
    } = req.body;

    const shortURL = await generateUniqueShortUrl();
    const timestamp = new Date();
    const newEvento = new Evento({
      title,
      artist,
      content,
      user_creator,
      site,
      price,
      payWhatYouWant,
      buy_ticket,
      date_start,
      date_end,
      url,
      image,
      youtubeVideoId,
      genre,
      status,
      highlighted,
      shortURL,
      timestamp,
    });
    if (req.file) {
      newEvento.image = req.file.path;
    }
    await newEvento.save();

    return res.status(200).json({ message: "Evento creado con éxito" });
  } catch (error) {
    error.message = "Erro ao crear evento";
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
const sendEmailsCorreccion = async (usuarios, evento, mensaje, asunto) => {
  for (const usuario of usuarios) {
    await enviarCorreccionEvento(usuario, evento, mensaje, asunto);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar 500 ms entre cada envío
  }
};
const sendCorreccion = async (req, res, next) => {
  try {
    const { mensaje, asunto, eventoId } = req.body;
    const evento = await Evento.findById(eventoId, "_id title").lean();
    const usuariosANotificar = await User.find(
      { $or: [{ newevent: true }, { newsletter: true }] },
      "email username"
    ).lean();
   
    await sendEmailsCorreccion(usuariosANotificar, evento, mensaje, asunto);
    return res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllEventos,
  getEventosDesdeHoy,
  getDraftEventos,
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
  sendCorreccion,
};
