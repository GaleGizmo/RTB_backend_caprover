require("dotenv").config();
const express = require("express");
const cors=require("cors")
const server = express();

server.use(express.urlencoded({extended:true}))
server.use(express.json())
const cloudinary=require("cloudinary").v2
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET

})
const PORT = process.env.PORT;

server.use(cors())

