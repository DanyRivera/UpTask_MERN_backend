import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {

    // const { _id } = req.usuario;
    const proyectos = await Proyecto.find({
        '$or': [
            { 'colaboradores': { $in: req.usuario } },
            { 'creador': { $in: req.usuario } }
        ]
    }).select('-tareas');

    res.json(proyectos)

}

const nuevoProyecto = async (req, res) => {

    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {

        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);

    } catch (error) {
        console.log(error);
    }

}

const obtenerProyecto = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id).populate({
        path: 'tareas',
        populate: {
            path: 'completado',
            select: 'nombre'
        }
    }).populate('colaboradores', "nombre email");

    if (!proyecto) {
        const error = new Error("Ese proyecto no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción no válida");
        return res.status(404).json({ msg: error.message })
    }

    res.json(proyecto);

}

const editarProyecto = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error("Ese proyecto no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {

        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);

    } catch (error) {
        console.log(error);
    }

}

const eliminarProyecto = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error("Ese proyecto no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(401).json({ msg: error.message })
    }

    try {

        await proyecto.deleteOne();
        res.json({ msg: "Proyecto Eliminado Correctamente" })

    } catch (error) {
        console.log(error)
    }

}

const buscarColaborador = async (req, res) => {

    const { email } = req.body;

    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message })
    }

    res.json(usuario);
}

const agregarColaborador = async (req, res) => {

    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ msg: error.message })
    }

    const colaborador = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');
    if (proyecto.colaboradores.includes(colaborador._id.toString())) {
        const error = new Error("Este usuario ya es colaborador");
        return res.status(401).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(401).json({ msg: error.message })
    }

    if (req.usuario.email === email) {
        const error = new Error("El creador del proyecto no puede ser colaborador");
        return res.status(401).json({ msg: error.message })
    }

    try {

        proyecto.colaboradores.push(colaborador._id);
        await proyecto.save();
        res.json({ msg: "El colaborador fue agregado correctamente" })

    } catch (error) {
        console.log(error)
    }

}

const eliminarColaborador = async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const proyecto = await Proyecto.findById(id);
    if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ msg: error.message })
    }

    //You are the admin
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Solo el administrador del proyecto puede eliminar colaboradores");
        return res.status(401).json({ msg: error.message })
    }

    try {

        proyecto.colaboradores.pull(req.body.id)

        await proyecto.save();

        res.json({ msg: 'Colaborador Eliminado Correctamente' })


    } catch (error) {
        console.log(error);
    }

}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
}