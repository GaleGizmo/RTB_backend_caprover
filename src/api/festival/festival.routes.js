const express = require("express");
const festivalRoutes = express.Router();

const { getFestivalEventos, createFestival, getFestivalById, festivalesToDisplay } = require("./festival.controller.js");

festivalRoutes.get("/:id", getFestivalById);
festivalRoutes.get("/:id/eventos", getFestivalEventos);
festivalRoutes.post("/", createFestival);
festivalRoutes.get("/toDisplay", festivalesToDisplay);

module.exports = festivalRoutes;