const express = require('express');
const { isAdmin, isAdminOrOwner } = require("../../middleware/auth.js")
const usuarioRoutes=express.Router();   

const { createUsuario, deleteUsuario, login, editUsuario } = require('./usuario.controller.js');

usuarioRoutes.post('/register', createUsuario);
usuarioRoutes.post('/login', login);
usuarioRoutes.put('/:idUsuario',[isAdminOrOwner],editUsuario);
usuarioRoutes.delete('/:idUsuario',[isAdmin],deleteUsuario);
module.exports=usuarioRoutes;