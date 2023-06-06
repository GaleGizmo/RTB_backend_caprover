const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const {isAuth} = require("../../middleware/auth.js")
const comentarioRoutes = express.Router();
const { getAllComentarios, getComentariosByUser, getComentariosByEvent, createComentario, deleteComentario, editComentario } = require('./comentario.controller.js');

comentarioRoutes.get('/', getAllComentarios);
comentarioRoutes.get('/getbyuser/:userId', [isAuth], getComentariosByUser);
comentarioRoutes.get('/getbyevent/:eventId', [isAuth], getComentariosByEvent);
comentarioRoutes.put('/:idComentario', [isAuth], editComentario);
comentarioRoutes.post('/', [isAuth], createComentario);
comentarioRoutes.delete('/:idComentario', [isAuth],deleteComentario);

module.exports = comentarioRoutes;