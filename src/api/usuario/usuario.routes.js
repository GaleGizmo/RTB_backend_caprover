const express = require('express');
const { isAdmin, isAdminOrOwner } = require("../../middleware/auth.js")
const usuarioRoutes=express.Router();   
const upload = require('../../middleware/img.js');
const { createUsuario, deleteUsuario, login, editUsuario } = require('./usuario.controller.js');

usuarioRoutes.post('/register', upload.single("avatar"),createUsuario);
usuarioRoutes.post('/login', login);
usuarioRoutes.put('/:idUsuario',[isAdminOrOwner], editUsuario);
usuarioRoutes.delete('/:idUsuario',[isAdmin], deleteUsuario);
module.exports=usuarioRoutes;