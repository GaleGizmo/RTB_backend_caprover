const express = require('express');
const {  isAdminOrComentarioOwner } = require("../../middleware/auth.js")
const {isAuth} = require("../../middleware/auth.js")
const comentarioRoutes = express.Router();
const { getAllComentarios, getComentariosByUser, getComentariosByEvent, createComentario, deleteComentario, editComentario } = require('./comentario.controller.js');

comentarioRoutes.get('/', getAllComentarios);
comentarioRoutes.get('/getbyuser/:userId', [isAuth], getComentariosByUser);
comentarioRoutes.get('/getbyevent/:eventId', getComentariosByEvent);
comentarioRoutes.put('/:idComentario', [isAdminOrComentarioOwner], editComentario);
comentarioRoutes.post('/', [isAuth], createComentario);
comentarioRoutes.delete('/:idComentario', [isAdminOrComentarioOwner],deleteComentario);

module.exports = comentarioRoutes;