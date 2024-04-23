const express = require('express');
const {  isAdminOrComentarioOwner, authenticate } = require("../../middleware/auth.js")
const comentarioRoutes = express.Router();
const { getAllComentarios, getComentariosByUser, getComentariosByEvent, createComentario, deleteComentario, editComentario } = require('./comentario.controller.js');

comentarioRoutes.get('/', getAllComentarios);
comentarioRoutes.get('/getbyuser/:userId', [authenticate], getComentariosByUser);
comentarioRoutes.get('/getbyevent/:eventId', getComentariosByEvent);
comentarioRoutes.put('/:idComentario', [isAdminOrComentarioOwner], editComentario);
comentarioRoutes.post('/', [authenticate], createComentario);
comentarioRoutes.delete('/:idComentario', [isAdminOrComentarioOwner],deleteComentario);

module.exports = comentarioRoutes;