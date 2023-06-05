const mongoose = require("mongoose");
// const Schema=mongoose.Schema es un paso optativo
const EventoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    content: { type: String,  required: true },
    user_creator: { type: mongoose.Types.ObjectId, ref:"usuario",  required: true  }, 
    site: { type: String, required: true }, 
    price: { type: Number,  required: true  },
    date_start: { type: Date, required: true },
    date_end: { type: Date},
    url: { type: String },
    image: { type: String },
    genre: { type: String }
  },
  {
    timestamps: true,
    collection: "evento"
  }
);

const Evento = mongoose.model("evento", EventoSchema);
module.exports = Evento;
