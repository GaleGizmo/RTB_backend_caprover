const { deleteImg } = require("../../middleware/deleteImg");
const Borrador = require("./borrador.model");

const setBorrador = async (req, res, next) => { 
    try {
        const newBorrador = req.body;
   
       if (!newBorrador.title) {
            return res.status(400).json({ message: "O título é obrigatorio" });
        }
        const borrador = new Borrador(newBorrador);
        if (req.file) {
            borrador.image = req.file.path;
        } else {
            borrador.image = "";
        }
        await borrador.save();
        return res.status(201).json(borrador);
    } catch (error) {
        console.error("Erro ao engadir o borrador:", error);
         return next(error);
    }
}

const getBorradorById = async (req, res, next) => {
    try {
        const idBorrador = req.params.idBorrador;
        const borrador = await Borrador.findById(idBorrador).populate('location');
        if (!borrador) {
            return res.status(404).json({ message: "Borrador non atopado" });
        }
        res.status(200).json(borrador);
    } catch (error) {
        console.error("Erro ao obter o borrador:", error);
        return next(error);
    }
}

const getAllBorradores = async (req, res, next) => {
    try {
        const borradores = await Borrador.find().populate('location');
        res.status(200).json(borradores);
    } catch (error) {
        console.error("Erro ao obter os borradores:", error);
         return next(error);
    }
}

const updateBorrador = async (req, res, next) => {
    try {
        const idBorrador = req.params.idBorrador;
        const borradorToUpdate = await Borrador.findById(idBorrador);
        if (!borradorToUpdate) {
            return res.status(404).json({ message: "Borrador non atopado" });
        }
        if (req.file) {
            if (borradorToUpdate.image) {
                deleteImg(borradorToUpdate.image);
            }
            borradorToUpdate.image = req.file.path;
        }
        const updatedBorrador = new Borrador(req.body);

        
        await Borrador.findByIdAndUpdate(idBorrador, updatedBorrador, { new: true });
        res.status(200).json(updatedBorrador);
    }
    catch (error) {
        console.error("Erro ao actualizar o borrador:", error);
        return next(error);
    }
}
const deleteBorrador = async (req, res, next) => {
    try {
        const borrador = await Borrador.findByIdAndDelete(req.params.id);
        if (!borrador) {
            return res.status(404).json({ message: "Borrador non atopado" });
        }
        res.status(200).json({ message: "Borrador eliminado correctamente" });
    } catch (error) {
        console.error("Erro ao eliminar o borrador:", error);
        return next(error);
    }
}

module.exports = {
    setBorrador,
    getBorradorById,
    getAllBorradores,
    updateBorrador,
    deleteBorrador
}
