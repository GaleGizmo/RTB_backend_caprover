const express = require("express");
const localizacionRoutes = express.Router();
const { isAdmin } = require("../../middleware/auth.js");

const {getLocalizaciones, addLocalizacion, } = require("./localizacion.controller.js");

localizacionRoutes.get("/", getLocalizaciones);
localizacionRoutes.post("/", isAdmin, addLocalizacion);


module.exports = localizacionRoutes;
