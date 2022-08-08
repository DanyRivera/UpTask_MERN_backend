import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();

//Para que pueda procesar la información tipo json
app.use(express.json());

dotenv.config();

conectarDB();

//Configurar CORS
const whiteList = [
    process.env.FRONTEND_URL,
    'https://uptask.vercel.app/'
];
const corsOptions = {
    origin: function (origin, callback) {
        // console.log(origin)

        if (whiteList.includes(origin)) {
            //Puede Consultar la API
            callback(null, true);
        } else {
            //No esta permitido su request
            callback(new Error("Error de CORS"))
        }
    }
}

app.use(cors(corsOptions));

//Routing
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})


//Socket.io
import { Server } from "socket.io";

const io = new Server(servidor, {
    pingTimeout: 6000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', (socket) => {
    // console.log('Conectado a Socket.io')

    //Definir los eventos de socket.io
    socket.on('abrir proyecto', proyectoId => {
        socket.join(proyectoId);
    })

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea eliminada', tarea);
    })

    socket.on('editar tarea', tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('tarea editada', tarea);
        // console.log(tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('estado cambiado', tarea);
    })

})



