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
    const festivalDestacado = await Festival.findOne({
      toBeFeatured: true,
    }).lean();

    if (festivalDestacado) {
      return res.status(200).json({
        isFestivalToDisplay: true,
        festivalId: festivalDestacado._id,
      });
    }

    return res.status(200).json({
      isFestivalToDisplay: false,
      festivalId: null,
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
    const { name, description, image, startDate, endDate, toBeFeatured } =
      req.body;
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
    const festival = await Festival.findById(festivalId);
    if (!festival) {
      throw new Error("Festival not found");
    }
    festival.eventos.push(eventoId);
    await festival.save();
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
