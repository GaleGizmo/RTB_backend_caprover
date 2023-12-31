const mongoose = require("mongoose");

const usuarioSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    username: { type: String, required: true, unique: true },
    role: { type: Number, required: true, unique: false, enum: [0, 1, 2] },
    birthday: { type: Date, required: false, unique: false },
    avatar: { type: String, required: false, unique: false },
    newsletter: { type: Boolean, required: false, default: false },
    newevent: { type: Boolean, required: false, default: false },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Evento" }],
    favoritesAlert: {type: Boolean, required: false, default: true }, 
  },
  
  {
    timestamps: true,
    collection: "usuario",
  }
);

const User = mongoose.model("usuario", usuarioSchema);
module.exports = User;
