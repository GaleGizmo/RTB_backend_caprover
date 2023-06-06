const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const eventoRoutes = express.Router();
const { getAllEventos, getEventoById,setEvento, deleteEvento, updateEvento } = require('./evento.controller.js');

eventoRoutes.get('/', getAllEventos);
eventoRoutes.get("/getbyid/:idEvento",getEventoById)
eventoRoutes.put('/:idEvento', [isAdmin],updateEvento);
eventoRoutes.post('/', [isAdmin], setEvento);
eventoRoutes.delete('/:idEvento', [isAdmin],deleteEvento);

module.exports = eventoRoutes;