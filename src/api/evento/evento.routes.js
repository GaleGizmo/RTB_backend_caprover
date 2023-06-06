const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const eventoRoutes = express.Router();
const { getAllEventos,setEvento, deleteEvento, updateEvento } = require('./evento.controller.js');
const { checkEventMandatoryFields } = require('../../middleware/checkfields.js');

eventoRoutes.get('/', getAllEventos);
eventoRoutes.put('/:idEvento', [isAdmin, checkEventMandatoryFields],updateEvento);
eventoRoutes.post('/', [isAdmin, checkEventMandatoryFields], setEvento);
eventoRoutes.delete('/:idEvento', [isAdmin],deleteEvento);

module.exports = eventoRoutes;