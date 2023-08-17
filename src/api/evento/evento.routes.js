const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const eventoRoutes = express.Router();

const { getAllEventos,setEvento, deleteEvento, updateEvento, getEventoById, sendEventosSemanales, remindEvento } = require('./evento.controller.js');
const { checkEventMandatoryFields } = require('../../middleware/checkfields.js');
const upload = require('../../middleware/img.js');

eventoRoutes.get('/', getAllEventos);
eventoRoutes.get("/getbyid/:idEvento", getEventoById)
eventoRoutes.put('/:idEvento', [isAdmin],upload.single("image"),updateEvento);
eventoRoutes.post('/', [isAdmin],upload.single("image"), setEvento);
eventoRoutes.get('/sendEventosSemanales', sendEventosSemanales);
eventoRoutes.get('/remindEvento', remindEvento);

eventoRoutes.delete('/:idEvento', [isAdmin],deleteEvento);

module.exports = eventoRoutes;