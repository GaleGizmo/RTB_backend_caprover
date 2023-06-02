const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const {isAuth} = require("../../middleware/auth.js")
const eventoRoute = express.Router();
const { getAllComentarios,setComentario, deleteComentario, updateComentario } = require('./evento.controller.js');

comentarioRoute.get('/', getAllComentarios);
comentarioRoute.put('/update/:idcomentario', [isAuth],updateComentario);
comentarioRoute.post('/', [isAuth], setComentario);
comentarioRoute.delete('/delete/:idcomentario', [isAuth],deleteComentario);

module.exports = comentarioRoute;