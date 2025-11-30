const express = require("express");
const { isAdmin } = require("../../middleware/auth.js");
const borradorRoutes = express.Router();

const {
    getAllBorradores,
    setBorrador,
    deleteBorrador,
    updateBorrador,
    getBorradorById,
    } = require("./borrador.controller.js");
const { upload, uploadToCloudinaryMiddleware } = require("../../middleware/img.js");

borradorRoutes.get("/", [isAdmin], getAllBorradores);
borradorRoutes.get("/getbyid/:idBorrador", [isAdmin], getBorradorById);
borradorRoutes.put("/:idBorrador", [isAdmin], upload.single("image"), uploadToCloudinaryMiddleware, updateBorrador);
borradorRoutes.post("/", [isAdmin], upload.single("image"), uploadToCloudinaryMiddleware, setBorrador);
borradorRoutes.delete("/:idBorrador", [isAdmin], deleteBorrador);

module.exports = borradorRoutes;