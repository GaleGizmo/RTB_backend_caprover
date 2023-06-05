require("dotenv").config();
const express = require("express");
const cors = require("cors");
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const PORT = process.env.PORT;

server.use(cors());

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const eventoRoutes = require("./src/api/evento/evento.routes");
const usuarioRoutes = require("./src/api/usuario/usuario.routes");
const comentarioRoutes = require("./src/api/comentario/comentario.routes");

server.use("/usuario", usuarioRoutes);
server.use("/evento", eventoRoutes);
server.use("/comentario", comentarioRoutes);

const db = require("./src/utils/db.js");
db.connectDB();

server.use((err, req, res, next) => {
  return res.status(err.status || 500).json(err.message || "Error inesperado");
});

server.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});

server.use("/", (req, res) => {
  res.send("its alive!");
});

server.listen(PORT, () => {
  console.log("El server pita en http://localhost:" + PORT);
});
