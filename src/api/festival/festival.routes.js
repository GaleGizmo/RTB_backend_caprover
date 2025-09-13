const express = require("express");
const festivalRoutes = express.Router();

const { getFestivalEventos, createFestival, getFestivalById, festivalesToDisplay, getNextFestivals } = require("./festival.controller.js");

festivalRoutes.get("/getFestival/:id", getFestivalById);
festivalRoutes.get("/getFestivalEventos/:id", getFestivalEventos);
festivalRoutes.post("/createFestival", createFestival);
festivalRoutes.get("/toDisplay", festivalesToDisplay);
festivalRoutes.get("/nextFestivals", getNextFestivals);

module.exports = festivalRoutes;