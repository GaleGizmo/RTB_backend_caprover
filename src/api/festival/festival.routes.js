const express = require("express");
const festivalRoutes = express.Router();

const { getFestivalEventos, createFestival, getFestivalById } = require("./festival.controller.js");

festivalRoutes.get("/:id", getFestivalById);
festivalRoutes.get("/:id/eventos", getFestivalEventos);
festivalRoutes.post("/", createFestival);

module.exports = festivalRoutes;