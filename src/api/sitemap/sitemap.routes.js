const express = require("express");
const router = express.Router();
const Evento = require("../evento/evento.model");

const FRONTEND_URL = "https://rockthebarrio.es";

router.get("/sitemap.xml", async (req, res) => {
  try {
    // Solo eventos futuros + últimos 30 días (por si alguien busca un evento reciente)
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const eventos = await Evento.find(
      { date_start: { $gte: treintaDiasAtras } },
      { shortURL: 1, _id: 1, updatedAt: 1 }
    ).lean();

    // Fecha actual para páginas estáticas
    const today = new Date().toISOString().split("T")[0];

    // Construir el XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página principal -->
  <url>
    <loc>${FRONTEND_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Páginas estáticas -->
  <url>
    <loc>${FRONTEND_URL}/contacto</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/terminos</loc>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/privacidad</loc>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>
  
  <!-- Eventos dinámicos -->
${eventos
  .map((evento) => {
    const slug = evento.shortURL || evento._id;
    const lastmod = evento.updatedAt
      ? new Date(evento.updatedAt).toISOString().split("T")[0]
      : today;
    return `  <url>
    <loc>${FRONTEND_URL}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    // Responder con el XML
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600"); // Cache 1 hora
    res.send(xml);
  } catch (error) {
    console.error("Error generando sitemap:", error);
    res.status(500).send("Error generando sitemap");
  }
});

module.exports = router;
