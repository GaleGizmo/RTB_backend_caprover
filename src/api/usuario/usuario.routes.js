const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const usuarioRoutes=express.Router();   

const { createUsuario, deleteUsuario, login } = require('./usuario.controller.js');

usuarioRoutes.post('/register', createUsuario);
usuarioRoutes.post('/login', login);

usuarioRoutes.delete('delete/:id',[isAdmin],deleteUsuario);
module.exports=usuarioRoutes;