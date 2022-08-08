import express from "express";
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
} from "../controllers/proyectoController.js";

import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

//Obtiene y Crea Proyectos
router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto);

//Obtiene UN Proyecto, lo edita o elimina
router.route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto)

router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;