// src/api/share/share.routes.js
const express = require("express");
const router = express.Router();
const Evento = require("../evento/evento.model");

router.get("/:shortURL", async (req, res) => {
 const { shortURL } = req.params;

  try {
     const evento = await Evento.findOne({ shortURL });

    if (!evento) {
      return res.status(404).send("Evento no encontrado");
    }

    const frontendURL = `https://www.rockthebarrio.es/${evento.shortURL}`;
    const image = evento.image || "https://www.rockthebarrio.es/logo.jpg";
    const description = evento.artist + " en " + evento.site 

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${evento.title}</title>
          <meta property="og:title" content="${evento.title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${frontendURL}" />
          <meta http-equiv="refresh" content="1; url=${frontendURL}" />
        </head>
        <body>
          <p>Redirigiendo a <a href="${frontendURL}">${frontendURL}</a></p>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
