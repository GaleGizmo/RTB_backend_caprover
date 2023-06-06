const User = require("../api/usuario/usuario.model");
const {verifyJwt}=require("../utils/jwt")
const Comentario = require("../api/comentario/comentario.model");

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

const isAdminOrOwner = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.json("No estás autorizado, chaval");
    }

    const parsedToken = token.replace("Bearer ", "");
    const validToken = verifyJwt(parsedToken);
    const userLogued = await User.findById(validToken.id);
    const { idUsuario } = req.params;

    // Comprueba si el usuario logueado es un admin o el propietario
    if (userLogued.role === 2 || userLogued.id === idUsuario) {
        userLogued.password = null;
        req.user = userLogued;
        next();
    } else 
    {return res.status(403).json("No estás autorizado para esta función, chavalote");}

    
  } catch (error) {
    return res.json();
  }
};

const isAdminOrComentarioOwner = async (req, res, next) => {
    try {
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(403).json("No estás autorizado, chaval");
      }
  
      const parsedToken = token.replace("Bearer ", "");
      const validToken = verifyJwt(parsedToken);
      const userLogued = await User.findById(validToken.id);
      const { idComentario } = req.params;
      const comentario = await Comentario.findById(idComentario);
     
  
      // Comprueba si el usuario logueado es un admin o el propietario
      if (userLogued.role === 2 || comentario.user===userLogued.id) {
          userLogued.password = null;
          req.user = userLogued;
          next();
      } else 
      {return res.status(403).json("No estás autorizado para esta función, chavalote");}
  
      
    } catch (error) {
      return res.json();
    }
  };
module.exports={isAuth, isAdmin, isAdminOrOwner, isAdminOrComentarioOwner}