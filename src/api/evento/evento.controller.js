const { checkMandatoryFields } = require("../../middleware/checkfields");
const { checkEventMandatoryFields } = require("../../utils/checkfields");
const Evento = require("./evento.model");

//recoge todos los eventos de la BBDD
const getAllEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.find()

    return res.json(eventos)

  } catch (error) {
    return next(error)
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
      subtitle,
      content,
      user_creator,
      site,
      price,
      date_start,
      date_end,
      url,
      image,
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
      date_start,
      date_end,
      url,
      image,
      genre,
      timestamp
    });

    await newEvento.save().then(() => {
      return res.status(200).json({message: "Evento creado con éxito"});
    });
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
    return next(error);
  }
};

//actualiza un evento de la BBDD
const updateEvento = async (req, res, next) => {
  try {
    
    //Comprobamos que los campos obligatorios estén rellenos mediante funcion en utils
    // if (!checkEventMandatoryFields(req.body)){
    //   return res.status(400).json({ message: "Campos obligatorios faltantes" });}

    const { idEvento } = req.params;

    let eventoToUpdate = await Evento.findById(idEvento);
    if (!eventoToUpdate) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

   
   

    eventoToUpdate = new Evento(req.body);
    if (req.file) {
      eventoToUpdate.body.image = req.file.path;
    }
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

module.exports = { getAllEventos, getEventoById, setEvento, updateEvento, deleteEvento };
