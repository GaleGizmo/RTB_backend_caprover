const Festival = require("./festival.model");

const getFestivalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const festival = await Festival.findById(id);
    if (!festival) {
      return res.status(404).json({ message: "Festival not found" });
    }

    return res.status(200).json(festival);
  } catch (error) {
    console.error("Error fetching festival by ID:", error);
    return next(error);
  }
};

const getNextFestivals = async (req, res, next) => {
  try {
    const today = new Date();
    const festivals = await Festival.find({
      endDate: { $gte: today },
    }).sort({ startDate: 1 });

    return res.status(200).json(festivals);
  } catch (error) {
    console.error("Error fetching next festivals:", error);
    return next(error);
  }
};

const festivalesToDisplay = async (req, res, next) => {
  try {
    const festivalesDestacados = await Festival.find({
      toBeFeatured: true,
    }).lean();

    if (festivalesDestacados.length > 0) {
      return res.status(200).json({
        isFestivalToDisplay: true,
        festivalIds: festivalesDestacados.map((f) => f._id),
      });
    }

    return res.status(200).json({
      isFestivalToDisplay: false,
      festivalIds: [],
    });
  } catch (error) {
    console.error("Error fetching festivales:", error);
    return next(error);
  }
};

const getFestivalEventos = async (req, res, next) => {
  try {
    const festivalId = req.params.id;
    const festival = await Festival.findById(festivalId).populate("eventos");

    if (!festival) {
      return res.status(404).json({ message: "Festival not found" });
    }
    const eventosDelFestival = festival.eventos.sort(
      (a, b) => new Date(a.date_start) - new Date(b.date_start)
    );

    res.status(200).json(eventosDelFestival);
  } catch (error) {
    console.error("Error fetching festival eventos:", error);
    return next(error);
  }
};

const createFestival = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, toBeFeatured } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    const newFestival = new Festival({
      name,
      description,
      image,
      startDate,
      endDate,
      toBeFeatured,
    });
    await newFestival.save();
    res.status(201).json(newFestival);
  } catch (error) {
    console.error("Error creating festival:", error);
    return next(error);
  }
};

const addEventoToFestival = async (festivalId, eventoId) => {
 try {
  //usando addToSet evitamos que se añadan eventos que ya existen en un mismo festival
    const festival = await Festival.findByIdAndUpdate(
      festivalId,
      { $addToSet: { eventos: eventoId } },
      { new: true }
    );

    if (!festival) {
      throw new Error("Festival not found");
    }

    return festival;
  } catch (error) {
    console.error("Error adding evento to festival:", error);
    throw error;
  }
};

const festivalDesactivado = async () => {
  try {
    const festivales = await Festival.find({ toBeFeatured: true }).populate(
      "eventos"
    );
    const hoy = new Date();

    const nombresDesactivados = [];
    for (const festival of festivales) {
      const eventos = festival.eventos;
      // Si NO hay ningún evento igual o posterior a hoy, desactivar el festival
      const tieneEventoFuturo = eventos.some(
        (evento) => new Date(evento.date_start) >= hoy
      );
      if (!tieneEventoFuturo) {
        festival.toBeFeatured = false;
        await festival.save();
        nombresDesactivados.push(festival.name);
      }
    }
    if (nombresDesactivados.length === 0) {
      console.log("Ningún festival desactivado.");
      return [];
    } else {
      console.log(`Festivales desactivados: ${nombresDesactivados.join(", ")}`);
      return nombresDesactivados;
    }
  } catch (error) {
    console.error("Error al desactivar festivales:", error);
    return error;
  }
};

module.exports = {
  getFestivalEventos,
  createFestival,
  addEventoToFestival,
  getFestivalById,
  festivalesToDisplay,
  festivalDesactivado,
  getNextFestivals,
};
