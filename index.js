require("dotenv").config();

const cors = require("cors");

const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT;

const db = require("./src/utils/db.js");

db.connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const express = require("express");
const eventoRoutes = require("./src/api/evento/evento.routes");
const usuarioRoutes = require("./src/api/usuario/usuario.routes");
const comentarioRoutes = require("./src/api/comentario/comentario.routes");

const server = express();

server.use(cors());

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/usuario", usuarioRoutes);
server.use("/evento", eventoRoutes);
server.use("/comentario", comentarioRoutes);

server.use((err, req, res, next) => {
  return res.status(err.status ||  500).json(err.message || "Unexpected error");
});

server.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});

server.use("/", (req, res) => {
  res.send("Working");
});

server.listen(PORT, () => {
  console.log("The server is working http://localhost/:" + PORT);
});