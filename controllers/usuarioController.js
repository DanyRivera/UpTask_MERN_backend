import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const registrar = async (req, res) => {

    //Creando un mensaje para registros duplicados
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email: email })

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({ msg: error.message })
    }

    try {

        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();

        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

        res.json({ msg: "Usuario Registrado Correctamente, Revisa tu Email para Confirmar tu Cuenta!" });

    } catch (error) {
        console.log(error.message);
    }

}

const autenticar = async (req, res) => {

    const { email, password } = req.body;

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ email: email })

    // console.log(usuario);

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(400).json({ msg: error.message })
    }

    //Comprobar si el usuario está confirmado
    if (usuario.confirmado === false) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(400).json({ msg: error.message })
    }

    //Comprobrar su password
    if (await usuario.comprobarPassword(password)) {

        res.json({
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })

    } else {
        const error = new Error("El password es incorrecto");
        return res.status(400).json({ msg: error.message })
    }
}

const confirmar = async (req, res) => {

    const { token } = req.params;
    const usuarioConfirmar = await Usuario.findOne({ token });

    if (!usuarioConfirmar) {
        const error = new Error("Token no Válido");
        return res.status(400).json({ msg: error.message })
    }

    try {

        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";
        await usuarioConfirmar.save();
        res.json({ msg: 'Usuario Confirmado Correctamente' })

    } catch (error) {
        console.log(error);
    }

}

const olvidePassword = async (req, res) => {

    const { email } = req.body;

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message })
    }

    try {

        usuario.token = generarId();
        await usuario.save();
        res.json({ msg: "Hemos enviado un email con las instrucciones" });

        emailOlvidePassword({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

    } catch (error) {
        console.log(error);
    }

}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    const tokenValido = await Usuario.findOne({ token });

    if (tokenValido) {

        res.json({ msg: "Token Válido y el Usuario Existe" });

    } else {
        const error = new Error("Token no Válido");
        return res.status(400).json({ msg: error.message })

    }

}

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });

    if (usuario) {

        usuario.password = password;
        usuario.token = '';

        try {

            await usuario.save();
            res.json({ msg: "Password Modificado Correctamente" })

        } catch (error) {
            console.log(error);
        }

    } else {
        const error = new Error("Token no Válido");
        return res.status(400).json({ msg: error.message })

    }
}

const perfil = async (req, res) => {

    const { usuario } = req;
    res.json( usuario );

}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}