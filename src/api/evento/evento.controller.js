const Evento = require("./evento.model");

//recoge todos los eventos de la BBDD
const getAllEventos=async (req,res, next)=>{
    try {
        const eventos= await Evento.find()
    
        return res.json(eventos)
        
    } catch (error) {
        return next(error)
    }
    }
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

    if (
      !title ||
      !content ||
      !user_creator ||
      !site ||
      !price ||
      !date_start ||
      !date_end
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

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
      genretimestamp,
    });

    await newEvento.save().then(() => {
      return res.status(200).json("evento creado con éxito");
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
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
    const { idEvento } = req.params;

    const requiredFields = [
      "title",
      "subtitle",
      "content",
      "user_creator",
      "site",
      "price",
      "date_start",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const eventoToUpdate = new Evento(req.body);
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

module.exports = {getAllEventos, setEvento, updateEvento, deleteEvento };
