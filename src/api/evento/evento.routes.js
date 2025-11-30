const express = require("express");
const { isAdmin } = require("../../middleware/auth.js");
const eventoRoutes = express.Router();

const {
  getAllEventos,
  setEvento,
  deleteEvento,
  updateEvento,
  getEventoById,
  sendEventosSemanalesHandler,
  remindEventosHandler,
  updateSiteField,
  getEventosDesdeHoy,
  getEventosParaCalendar,
  getEventosEntreFechas,
  sendEventosDiarios,
 
  sendCorreccion,
} = require("./evento.controller.js");

const { upload, uploadToCloudinaryMiddleware } = require("../../middleware/img.js");

eventoRoutes.get("/", getAllEventos);
eventoRoutes.get("/eventosDesdeHoy", getEventosDesdeHoy);
eventoRoutes.get("/eventosParaCalendar", getEventosParaCalendar);
eventoRoutes.post("/eventosEntreFechas", getEventosEntreFechas);
eventoRoutes.get("/getbyid/:idEvento", getEventoById);
eventoRoutes.put("/:idEvento", [isAdmin], upload.single("image"), uploadToCloudinaryMiddleware, updateEvento);
eventoRoutes.post("/", [isAdmin], upload.single("image"), uploadToCloudinaryMiddleware, setEvento);
eventoRoutes.get("/sendEventosSemanales", sendEventosSemanalesHandler);
eventoRoutes.get("/remindEvento", remindEventosHandler);
eventoRoutes.get("/sendEventosDiarios", [isAdmin], sendEventosDiarios);
eventoRoutes.delete("/:idEvento", [isAdmin], deleteEvento);
eventoRoutes.post("/correccion", [isAdmin], sendCorreccion);
eventoRoutes.post("/updateSiteField", isAdmin, updateSiteField);

module.exports = eventoRoutes;
