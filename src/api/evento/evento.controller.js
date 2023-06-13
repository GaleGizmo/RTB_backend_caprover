const { checkMandatoryFields } = require("../../middleware/checkfields");
const { deleteImg } = require("../../middleware/deleteImg");

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
    
    // if (!req.body.title || !req.body.subtitle  || !req.body.content || !req.body.site || !req.body.date_start){
    //   return res.status(400).json({message: "Faltan campos obligatorios"});
    // }
    
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
    if (req.file) {
      newEvento.image = req.file.path;
    }
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

module.exports = { getAllEventos, getEventoById, setEvento, updateEvento, deleteEvento };
