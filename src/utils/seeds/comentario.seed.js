const mongoose = require("mongoose");
const Comment = require("../../api/comentario/comentario.model");
require("dotenv").config();
const DB_URL = process.env.DB_URL;

const misComentarios = [
    {
        user:"647e129a8ad57f9c059d621b",
        event:"647e16d4a4e03f94f62caaa4",
        title:"¡¡¡Viva San Fermin!!!",
        content:"Las mejores fiestas de toda España, Aupa San Fermin :)",
        value:"5"
    }
];

mongoose.connect(DB_URL).then(async () => {
    const allComentarios = await Comment.find();
    if (allComentarios) {
        await Comment.collection.drop().catch((error) => {console.log(error)});
    }
}).catch((error) => console.log("Error al borrar los registros de los comentarios de la BBDD", error))
    .then(async () => {
        await Comment.insertMany(misComentarios).then("Datos insertados");
    }).catch((error) => console.log("Error al insertar los comentarios en la BBDD", error))
    .finally(() => mongoose.disconnect());
