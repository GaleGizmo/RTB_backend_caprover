const mongoose = require("mongoose");
const User = require("../../api/usuario/usuario.model");
require("dotenv").config();
const DB_URL = process.env.DB_URL;

const misUsuarios = [
    {
        email:"JMiguel@RockTheBarrio.com",
        password: "$2y$10$uXYI7rdu4IdRYZfpDCoXpuXpzFHEnO3L9hF7N9DPM/qfhXQl2R8hi",
        username: "Miguel",
        role:2,
        birthday:"",
        avatar:""
    },
    {
        email:"Moha@RockTheBarrio.com",
        password: "$2y$10$uXYI7rdu4IdRYZfpDCoXpuXpzFHEnO3L9hF7N9DPM/qfhXQl2R8hi",
        username: "Moha",
        role:2,
        birthday:"",
        avatar:""
    }, 
    {
        email:"Alex@RockTheBarrio.com",
        password: "$2y$10$uXYI7rdu4IdRYZfpDCoXpuXpzFHEnO3L9hF7N9DPM/qfhXQl2R8hi",
        username: "Alex",
        role:2,
        birthday:"",
        avatar:""
    },
    {
        email:"Andrea@RockTheBarrio.com",
        password: "$2y$10$uXYI7rdu4IdRYZfpDCoXpuXpzFHEnO3L9hF7N9DPM/qfhXQl2R8hi",
        username: "Andrea",
        role:2,
        birthday:"",
        avatar:""
    },
    {
        email:"prueba@RockTheBarrio.com",
        password: "$2y$10$uXYI7rdu4IdRYZfpDCoXpuXpzFHEnO3L9hF7N9DPM/qfhXQl2R8hi",
        username: "prueba",
        role:1,
        birthday:"",
        avatar:""
    }
    
];

mongoose.connect(DB_URL).then(async () => {
    const allUsers = await User.find();
    if (allUsers) {
        await User.collection.drop().catch((error) => {console.log(error)});
    }
}).catch((error) => console.log("Error al borrar los registros de los usuarios de la BBDD", error))
    .then(async () => {
        await User.insertMany(misUsuarios).then("Datos insertados");
    }).catch((error) => console.log("Error al insertar los usuarios en la BBDD", error))
    .finally(() => mongoose.disconnect());