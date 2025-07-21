const fs = require("fs");
const path = require("path");

function generarHtmlEvento(evento) {
  const outputDir = path.join(__dirname, "../../eventos_html");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${evento.title}</title>
  <meta name="description" content="${evento.artist} en ${evento.site.split(",")[0]}">
  <meta property="og:title" content="${evento.title}">
  <meta property="og:description" content="${evento.artist} en ${evento.site.split(",")[0]}">
  <meta property="og:image" content="${evento.image}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://rockthebarrio.es/html/${evento.shortURL}.html">
  <meta http-equiv="refresh" content="0; url=https://rockthebarrio.es/${evento.shortURL}" />
</head>
<body>
  <h1>${evento.title}</h1>
  <p>${evento.artist} en ${evento.site}</p>
  <img src="${evento.image}" alt="${evento.title}">
</body>
</html>
  `;
  fs.writeFileSync(
    path.join(outputDir, `${evento.shortURL}.html`),
    html,
    "utf8"
  );
}

module.exports = { generarHtmlEvento };