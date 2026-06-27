const express = require("express");
const festivalRoutes = express.Router();

const { getFestivalEventos, createFestival, getFestivalById, festivalesToDisplay, getNextFestivals } = require("./festival.controller.js");
const { upload, uploadLogoToCloudinaryMiddleware } = require("../../middleware/img.js");
const { isAdmin } = require("../../middleware/auth.js");

festivalRoutes.get("/getFestival/:id", getFestivalById);
festivalRoutes.get("/getFestivalEventos/:id", getFestivalEventos);
festivalRoutes.post("/createFestival", [isAdmin], upload.single("image"), uploadLogoToCloudinaryMiddleware, createFestival);
festivalRoutes.get("/toDisplay", festivalesToDisplay);
festivalRoutes.get("/nextFestivals", getNextFestivals);

module.exports = festivalRoutes;