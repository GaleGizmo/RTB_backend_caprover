const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const eventoRoutes = express.Router();
const { getAllEventos,setEvento, deleteEvento, updateEvento } = require('./evento.controller.js');

eventoRoutes.get('/', getAllEventos);
eventoRoutes.put('/update/:idEvento', [isAdmin],updateEvento);
eventoRoutes.post('/', [isAdmin], setEvento);
eventoRoutes.delete('/delete/:idEvento', [isAdmin],deleteEvento);

module.exports = eventoRoutes;