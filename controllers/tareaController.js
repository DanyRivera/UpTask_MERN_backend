import mongoose from "mongoose";
import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

const agregarTarea = async (req, res) => {

    const { proyecto } = req.body;
    if (!mongoose.Types.ObjectId.isValid(proyecto)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const proyectoExiste = await Proyecto.findById(proyecto)
    if (!proyectoExiste) {
        const error = new Error("Ese Proyecto no Existe");
        return res.status(404).json({ msg: error.message })
    }

    //Validar que el que está autenticado es el creador del proyecto
    const { _id } = req.usuario;
    if (_id.toString() !== proyectoExiste.creador.toString()) {
        const error = new Error("Solo el creador puede añadir tareas");
        return res.status(401).json({ msg: error.message })
    }


    try {
        const tarea = await Tarea.create(req.body); //Es lo mismo que:
        // const tarea = new Tarea(req.body);
        // const tareaAlmacenada = await tarea.save();
        proyectoExiste.tareas.push(tarea._id);
        await proyectoExiste.save();
        res.json(tarea)

    } catch (error) {
        console.log(error);
    }
}

const obtenerTarea = async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
        const error = new Error("Esa tarea no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (req.usuario._id.toString() !== tarea.proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para ver la tarea");
        return res.status(403).json({ msg: error.message })
    }

    res.json(tarea);
}

const actualizarTarea = async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
        const error = new Error("Esa tarea no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (req.usuario._id.toString() !== tarea.proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para editar la tarea");
        return res.status(403).json({ msg: error.message })
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {

        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada);

    } catch (error) {
        console.log(error);
    }
}

const eliminarTarea = async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
        const error = new Error("Esa tarea no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (req.usuario._id.toString() !== tarea.proyecto.creador.toString()) {
        const error = new Error("No tienes los permisos para editar la tarea");
        return res.status(403).json({ msg: error.message })
    }

    try {

        const proyecto = await Proyecto.findById(tarea.proyecto._id);
        proyecto.tareas.pull(tarea._id);

        await Promise.allSettled([
            await proyecto.save(),
            await tarea.deleteOne()
        ])

        return res.json({ msg: "Tarea eliminada correctamente" })

    } catch (error) {
        console.log(error);
    }

}

const cambiarEstado = async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Id no Válido");
        return res.status(401).json({ msg: error.message })
    }

    const tarea = await Tarea.findById(id).populate("proyecto");
    if (!tarea) {
        const error = new Error("Esa tarea no existe");
        return res.status(404).json({ msg: error.message })
    }

    if (req.usuario._id.toString() !== tarea.proyecto.creador.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error("Acción no válida");
        return res.status(403).json({ msg: error.message })
    }

    try {

        tarea.estado = !tarea.estado;
        tarea.completado = req.usuario._id;
        await tarea.save();

        const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado");

        res.json(tareaAlmacenada);

    } catch (error) {
        console.log(error)
    }

}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}