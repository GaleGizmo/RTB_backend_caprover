const mongoose = require("mongoose");
const Evento = require("../../api/evento/evento.model");
require("dotenv").config();
const DB_URL = process.env.DB_URL;

misEventos = [
    {
    title: "Musicales San Fermin 2023",
    artist: "San Fermin 2023",
    content: "Conciertos de San Fermin 2023, Pamplona Iruña",
    user_creator:"647e129a8ad57f9c059d6218", 
    site: "Pamplona", 
    price: 0,
    date_start: new Date("2023-07-07"),
    date_end: new Date("2023-07-14"),
    url: "",
    image: "",
    genre: ""
    }
];

mongoose.connect(DB_URL).then(async () => {
    const allEventos = await Evento.find();
    if (allEventos) {
        await Evento.collection.drop().catch((error) => {console.log(error)});
    }
}).catch((error) => console.log("Error al borrar los registros de los eventos de la BBDD", error))
    .then(async () => {
        await Evento.insertMany(misEventos);
    }).catch((error) => console.log("Error al insertar los eventos en la BBDD", error))
    .finally(() => mongoose.disconnect());