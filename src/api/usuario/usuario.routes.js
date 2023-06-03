const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const usuarioRoutes=express.Router();   

const {deleteUsuario}=require('./usuario.controller.js');

usuarioRoutes.delete('delete/:id',[isAdmin],deleteUsuario);
module.exports=usuarioRoutes;