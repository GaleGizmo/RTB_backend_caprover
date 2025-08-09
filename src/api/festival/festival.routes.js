const express = require("express");
const festivalRoutes = express.Router();

const { getFestivalEventos, createFestival, getFestivalById, festivalesToDisplay } = require("./festival.controller.js");

festivalRoutes.get("/getFestival/:id", getFestivalById);
festivalRoutes.get("/getFestivalEventos/:id", getFestivalEventos);
festivalRoutes.post("/createFestival", createFestival);
festivalRoutes.get("/toDisplay", festivalesToDisplay);

module.exports = festivalRoutes;