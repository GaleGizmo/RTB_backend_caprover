const express = require('express');
const {  isAdminOrOwner, authenticate } = require("../../middleware/auth.js")
const usuarioRoutes=express.Router();   
const { upload, uploadToCloudinaryMiddleware } = require('../../middleware/img.js');
const { createUsuario, deleteUsuario, login, editUsuario, forgotPassword, resetPassword, unsubscribe, addFavorite, sendUserMessage } = require('./usuario.controller.js');

usuarioRoutes.post('/register', upload.single("avatar"), uploadToCloudinaryMiddleware, createUsuario);
usuarioRoutes.post('/login', login);
usuarioRoutes.put('/:idUsuario',[isAdminOrOwner], upload.single("avatar"), uploadToCloudinaryMiddleware, editUsuario);
usuarioRoutes.put('/reset-password/unsubscribe/:idUsuario',[isAdminOrOwner], unsubscribe)
usuarioRoutes.delete('/:idUsuario',[isAdminOrOwner], deleteUsuario);
usuarioRoutes.post('/recuperar-password', forgotPassword)
usuarioRoutes.post('/reset-password', resetPassword)
usuarioRoutes.post('/message', sendUserMessage)
usuarioRoutes.patch('/add-favorite', [authenticate], addFavorite)
module.exports=usuarioRoutes;