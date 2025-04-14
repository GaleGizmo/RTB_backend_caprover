require("dotenv").config();
const { CronJob } = require('cron');
const express = require("express");
const cors = require("cors");
const { startCronJobs } = require("./src/cron/cronjobs.js");
const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT;
const jwt = require('jsonwebtoken');
const db = require("./src/utils/db.js");
const http = require("http");

db.connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

startCronJobs()

//Rutas principales
const eventoRoutes = require("./src/api/evento/evento.routes");
const usuarioRoutes = require("./src/api/usuario/usuario.routes");
const comentarioRoutes = require("./src/api/comentario/comentario.routes");


app.use("/usuario", usuarioRoutes);
app.use("/evento", eventoRoutes);
app.use("/comentario", comentarioRoutes);

app.get("/", (req, res) => {
  res.status(200).json("Working");
});

app.use("*", (req, res) => {
  return res.status(404).json("Route not found");
});
// Middleware para manejar errores
app.use((err, req, res, next) => {
  if (err instanceof jwt.TokenExpiredError) {
    return res
      .status(401)
      .json({
        message: "A túa sesión expirou, por favor volve iniciar sesión",
      });
  }
  return res.status(err.status || 500).json(err.message || "Unexpected error");
});



function startServer(port, callback) {
  const server = http.createServer(app);
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        `El puerto ${port} está en uso. Intentando iniciar el servidor en el puerto ${
          port + 1
        }`
      );
      server.close(() => startServer(port + 1, callback)); // Cierra el servidor actual antes de intentar en otro puerto
    } else {
      console.error("Error desconocido:", err);
      if (callback) callback(err);
    }
  });

  server.listen(port, () => {
    console.log(`Servidor iniciado correctamente en el puerto ${port}`);
    if (callback) callback(null, port, server);
  });
  return server
}
startServer(PORT)
  

module.exports = { startServer };
