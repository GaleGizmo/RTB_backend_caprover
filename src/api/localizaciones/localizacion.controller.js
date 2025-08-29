const Localizacion = require('./localizacion.model')
require("dotenv").config();

const getLocalizaciones = async (req, res, next) => {
  try {
    const localizaciones = await Localizacion.find();
    res.status(200).json(localizaciones);
  } catch (error) {
    console.error("Error al obtener localizaciones:", error);
    next(error);
  }
};

const addLocalizacion = async (req, res) => {
  try {
    const { direccion } = req.body;

    if (!direccion) {
      return res.status(400).json({ error: "La dirección es obligatoria" });
    }

    // URL de la API de Google Maps
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      direccion
    )}&key=${process.env.GEOCODING_API_KEY}`;

    // Petición a la API de Google
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      return res.status(404).json({
        error: "No se pudo encontrar la ubicación para la dirección proporcionada",
      });
    }

    // Extraer datos de la respuesta
    const result = data.results[0];
    const formattedAddress = result.formatted_address;
    const { lat, lng } = result.geometry.location;

    // El nombre será la parte de la dirección hasta la primera coma
    const name = direccion.split(",")[0].trim();

    // Crear la localización en la base de datos
    const nuevaLocalizacion = new Localizacion({
      name,
      address: formattedAddress,
      coordenates: { lat, lng },
    });

    await nuevaLocalizacion.save();

    return res.status(201).json({
      message: "Localización creada correctamente",
      localizacion: nuevaLocalizacion,
    });
  } catch (error) {
    console.error("Error al crear localización:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};



module.exports = {
  getLocalizaciones,
  addLocalizacion,
 
};