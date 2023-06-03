const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const {isAuth} = require("../../middleware/auth.js")
const comentarioRoutes = express.Router();
const { getAllComentarios, setComentario, deleteComentario, updateComentario } = require('./comentario.controller.js');

comentarioRoutes.get('/', getAllComentarios);
comentarioRoutes.put('/update/:idcomentario', [isAuth], updateComentario);
comentarioRoutes.post('/', [isAuth], setComentario);
comentarioRoutes.delete('/delete/:idcomentario', [isAuth],deleteComentario);

module.exports = comentarioRoutes;