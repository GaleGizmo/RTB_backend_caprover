const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const eventoRoute = express.Router();
const { getAllEventos,setEvento, deleteEvento, updateEvento } = require('./evento.controller.js');

eventoRoute.get('/', getAllEventos);
eventoRoute.put('/update/:idEvento', [isAdmin],updateEvento);
eventoRoute.post('/', [isAdmin], setEvento);
eventoRoute.delete('/delete/:idEvento', [isAdmin],deleteEvento);

module.exports = eventoRoute;