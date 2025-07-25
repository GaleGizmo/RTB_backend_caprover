const express = require("express");
const router = express.Router();
const Evento = require("../evento/evento.model");

const isSocialBot = (userAgent = "") => {
  return /facebook|facebot|twitter|linkedin|slack|discord|pinterest|bot|crawler/i.test(
    userAgent
  );
};

router.get("/:shortURL", async (req, res) => {
  const { shortURL } = req.params;
  const userAgent = req.headers["user-agent"] || "";

  try {
    const evento = await Evento.findOne({ shortURL });

    if (!evento) {
      return res.status(404).send("Evento no encontrado");
    }

    const frontendURL = `https://www.rockthebarrio.es/${evento.shortURL}`;
    const image = evento.image?.startsWith("http") ? evento.image : "https://www.rockthebarrio.es/assets/no-image.jpg";

    const description = evento.artist + " en " + evento.site;

    const isBot = isSocialBot(userAgent);

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
          <meta name="twitter:card" content="summary_large_image" />
          ${
            !isBot
              ? `<meta http-equiv="refresh" content="1; url=${frontendURL}" />`
              : ""
          }
        </head>
        <body>
          ${
            isBot
              ? `<h1>${evento.title}</h1><p>Vista previa generada para bots sociales</p>`
              : `<p>Redirigiendo a <a href="${frontendURL}">${frontendURL}</a></p>
                 <noscript><p><a href="${frontendURL}">Ver evento</a></p></noscript>`
          }
        </body>
      </html>
    `;
    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    console.log(
      `[SHARE HIT] slug: ${shortURL} | bot: ${isBot} | UA: ${userAgent}`
    );

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
