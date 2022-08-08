import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        //Elimina espacios
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    //Agrega dos columnas de creado y modíficado
    timestamps: true
});

//Hace un hash a las password
usuarioSchema.pre('save', async function(next) {

    if(!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

})

//Compara el password del formulario y el password con el hash (retorna true o false)
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;


