const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    content: { type: String,  required: true },
    user_creator: { type: mongoose.Types.ObjectId, ref:"usuario",  required: true  }, 
    site: { type: String, required: true }, 
    price: { type: Number,  required: true  },
    payWhatYouWant: {type: Boolean, default:false},
    date_start: { type: Date, required: true },
    date_end: { type: Date},
    buy_ticket: {type: String},
    url: { type: String },
    image: { type: String },
    youtubeVideoId: {type: String},
    genre: { type: String },
    status: {type: String},
    highlighted: {type: Boolean, default:false},
    commentsCount: { type: Number, default: 0 },
    shortURL: {type: String, unique:true}
  },
  {
    timestamps: true,
    collection: "evento"
  }
);

const Evento = mongoose.model("evento", EventoSchema);
module.exports = Evento;
