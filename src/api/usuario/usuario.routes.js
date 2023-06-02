const express = require('express');
const { isAdmin } = require("../../middleware/auth.js")
const usuarioRoute=express.Router();   

const {deleteUsuario}=require('./usuario.controller.js');

usuarioRoute.delete('delete/:id',[isAdmin],deleteUsuario);
