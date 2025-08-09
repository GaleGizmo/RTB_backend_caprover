const mongoose = require("mongoose");

const festivalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  eventos: [{ type: mongoose.Schema.Types.ObjectId, ref: "evento" }],
  toBeFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
  collection: "festival"
});

const Festival = mongoose.model("festival", festivalSchema);
module.exports = Festival;
