const mongoose = require("mongoose");

const borradorSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String },
    content: { type: String },
    user_creator: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
    site: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "localizacion" },
    payWhatYouWant: { type: Boolean, default: false },
    price: { type: Number },
    buy_ticket: { type: String },
    date_start: { type: Date },
    date_end: { type: Date },
    url: { type: String },
    image: { type: String },
    youtubeVideoId: { type: String },
    genre: { type: String },
    status: { type: String, default: "draft" },
    highlighted: { type: Boolean, default: false },
    shortURL: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "borrador" }
);

const Borrador = mongoose.model("borrador", borradorSchema);
module.exports = Borrador;
