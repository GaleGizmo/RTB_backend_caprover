const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
    {
        user:{type: mongoose.Types.ObjectId, ref: "usuario"},
        event:{type:mongoose.Types.ObjectId, ref:"evento"},
        title:{type:String, required:false, unique:false},
        content:{type:String, required:false, unique:false},
        value:{type:Number, required:false, unique:false}
    },
    {
        timestamps: true,
        collection:"comentario"
    }
);

const Comentario = mongoose.model("comentario", commentSchema);
module.exports = Comentario;