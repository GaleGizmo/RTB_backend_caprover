require("dotenv").config();

const cors = require("cors");
const cron = require('node-cron');
const cloudinary = require("cloudinary").v2;
const { remindEvento, sendEventosSemanales } = require("./src/api/evento/evento.controller.js");
const PORT = process.env.PORT;

const db = require("./src/utils/db.js");

db.connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
//envío de recordatorio de eventos favoritos cada día a las 10am
// cron.schedule('0 10 * * *', () => {
//   remindEvento()
//   .then(() => {
//     console.log("remindEvento ejecutado con éxito.");
//   })
//   .catch((error) => {
//     console.error("Error al ejecutar remindEvento:", error);
//   });
// });
//envío de listado de eventos semanales los lunes a las 10am
// cron.schedule('45 08 * * 4', () => {
// sendEventosSemanales()
//   .then(() => {
//     console.log("sendEventosSemanales ejecutado con éxito.");
//   })
//   .catch((error) => {
//     console.error("Error al ejecutar sendEventosSemanales:", error);
//   });
// })

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
  return res.status(err.status || 500).json(err.message || "Unexpected error");
});

server.use("/", (req, res) => {
  res.status(200).json("Working");
});

server.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});


function startServer(port) {
  server.listen(port, function(err) {
    if (err) {
      console.log('Error al iniciar el servidor en el puerto ' + port);
      if (err.code === 'EADDRINUSE') {
        console.log('Intentando iniciar el servidor en un puerto alternativo');
        startServer(port + 1);
      } else {
        console.log('Error desconocido:', err);
      }
    } else {
      console.log('Servidor iniciado en el puerto ' + port);
    }
  });
}
startServer(PORT);