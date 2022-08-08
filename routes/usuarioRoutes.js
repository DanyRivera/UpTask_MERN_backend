import express from "express";
import { 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken, 
    nuevoPassword,
    perfil
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";
 
const router = express.Router();

//Registro, Confirmación y Autenticación de Usuarios
router.post('/', registrar); //Crea un nuevo usuario
router.post('/login', autenticar); //Autentica un usuario
router.get('/confirmar/:token', confirmar); //Confirma Usuarios
router.post('/olvide-password', olvidePassword) //Resetear Password
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)
//En lugar de:
// router.get('/olvide-password/:token', comprobarToken) //Comprobar el token para resetear password
// router.post('/olvide-password/:token', nuevoPassword) //Almacenar nueva password

router.get('/perfil', checkAuth, perfil) //Proteger endpoint con el middleware chechout

export default router;


