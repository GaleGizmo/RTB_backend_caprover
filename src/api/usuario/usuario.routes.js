const express = require('express');
const {  isAdminOrOwner, authenticate } = require("../../middleware/auth.js")
const usuarioRoutes=express.Router();   
const upload = require('../../middleware/img.js');
const { createUsuario, deleteUsuario, login, editUsuario, forgotPassword, resetPassword, unsubscribe, addFavorite } = require('./usuario.controller.js');

usuarioRoutes.post('/register', upload.single("avatar"),createUsuario);
usuarioRoutes.post('/login', login);
usuarioRoutes.put('/:idUsuario',[isAdminOrOwner], upload.single("avatar"), editUsuario);
usuarioRoutes.put('/reset-password/unsubscribe/:idUsuario',[isAdminOrOwner], unsubscribe)
usuarioRoutes.delete('/:idUsuario',[isAdminOrOwner], deleteUsuario);
usuarioRoutes.post('/recuperar-password', forgotPassword)
usuarioRoutes.post('/reset-password', resetPassword)
usuarioRoutes.patch('/add-favorite', [authenticate], addFavorite)
module.exports=usuarioRoutes;