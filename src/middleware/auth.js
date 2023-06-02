const User = require("../api/usuario/usuario.model");
const {verifyJwt}=require("../utils/jwt")

const isAuth=async (req,res,next)=>{

    try {
        
        const token=req.headers.authorization;

        if (!token){
            return res.json("No estás autorizado chaval")
        }
        const parsedToken=token.replace("Bearer ","")

        const validToken=verifyJwt(parsedToken)
        const userLogued= await User.findById(validToken.id)
        userLogued.password=null
        req.user=userLogued
        next()

    } catch (error) {
        return res.json()
    }
}

const isAdmin=async (req,res,next)=>{

    try {
        
        const token=req.headers.authorization;

        if (!token){
            return res.json("No estás autorizado chaval")
        }
        const parsedToken=token.replace("Bearer ","")

        const validToken=verifyJwt(parsedToken)
        const userLogued= await User.findById(validToken.id)
       

        if (userLogued.role===2){
            userLogued.password=null
            req.user=userLogued
            next()
        } else return res.json("No estás autorizado para esta función, chavalote")
        

    } catch (error) {
        return res.json()
    }
}

module.exports={isAuth, isAdmin}