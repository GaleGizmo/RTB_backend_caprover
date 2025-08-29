const mongoose = require("mongoose");

const LocalizacionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordenates: {
      _id: false,
      type: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      required: true,
    },
  },
  { timestamps: true, collection: "localizacion" }
);

const Localizacion = mongoose.model("localizacion", LocalizacionSchema);

module.exports = Localizacion;
