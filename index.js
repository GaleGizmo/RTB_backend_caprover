const express = require('express')
const server = express()
const cors = require('cors')

server.use(cors())

const router = express.Router()


server.use(express.static("public"))

// nos permite poder recibir peticiones POST en formato JSON
server.use(express.json())

server.use("/", router)

server.listen(3000, ()=>{
    console.log("Servidor online en puerto 3000")
})

module.export = server