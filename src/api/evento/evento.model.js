const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    content: { type: String, required: true },
    user_creator: {
      type: mongoose.Types.ObjectId,
      ref: "usuario",
      required: true,
    },
    site: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "localizacion" },
    price: { type: Number, required: true },
    payWhatYouWant: { type: Boolean, default: false },
    date_start: { type: Date, required: true },
    buy_ticket: { type: String },
    url: { type: String },
    image: { type: String },
    youtubeVideoId: { type: String },
    genre: { type: String },
    status: { type: String },
    highlighted: { type: Boolean, default: false },
    commentsCount: { type: Number, default: 0 },
    shortURL: { type: String, unique: true },
    festival: { type: mongoose.Schema.Types.ObjectId, ref: "festival" },
  },
  {
    timestamps: true,
    collection: "evento",
  }
);

const Evento = mongoose.model("evento", EventoSchema);
module.exports = Evento;
