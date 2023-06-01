const  Evento  = require("./evento.model");

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
      genretimestamp,
    });

    await newEvento.save().then(() => {
      return res.status(200).json(" evento creado");
    });
  } catch (error) {
    return next(error);
  }
};



module.exports = { setEvento};