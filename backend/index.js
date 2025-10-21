/* eslint-disable no-undef */
/* eslint-env node */
// 1. Importar Express para poder usarlo
import cors from "cors";
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from "../backend/routers/authRoutes.js";
import catalinaRoutes from './routers/catalinaRoutes.js';
import router from "./routers/orderRoutes.js";


// 2. Crear una instancia de la aplicación express
const app = express();

app.use(cors()); // <-- Usar Cors (¿Ponerlo antes de las rutas!)

// 3. Definir un puerto para que el servidor escuche
// Usa una variable de entorno si está disponible, o el puerto 4000 por defecto
const PORT = process.env.PORT || 4000;

// ---Nuevos Cambios---
// 1. Middelware para que express entienda JSON
// Esto es muy imporatne. permite que tu servidor reciba datos JSON en las peticiones
app.use(express.json());

// 2. Importar las rutas
// 2. Usar las rutas
// Montamos el router que maneja /api/catalinas
app.use('/api/catalinas', catalinaRoutes);
// 3. (Hecho arriba) El router monta las rutas en /api/catalinas
// ---Fin de los cambios

app.use('/api/orders', router)

app.use('/api/auth', authRoutes);


// Ayuda al desarrollador si accidentalmente este archivo se ejecuta en un entorno
// donde `process` no existe (por ejemplo: en el navegador). En Node `process`
// siempre existe, así que esto indica que el archivo se está utilizando en el
// lugar equivocado.
if (typeof process === 'undefined') {
  console.error('La variable global `process` no está definida. Asegúrate de ejecutar este archivo con Node.js (ej: node backend/index.js), no en el navegador.');
}

if (!process.env.MONGO_URI) {
  console.warn('ADVERTENCIA: `MONGO_URI` no está definida en el archivo .env. La conexión a MongoDB fallará si no la defines.');
}

// ---Nuevo Código de conexión---
// a. Conectar a la base de datos MongoDB
// a. Conectar a la base de datos MongoDB (si está configurada)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Conectado a MongoDB Atlas');
      // Solo después de una conexion exitosa, ponemos el servidor a escuchar
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Error de conexion a MongoDB: ', error.message);
      process.exit(1);
    });
} else {
  console.warn('ADVERTENCIA: `MONGO_URI` no está definida. Iniciando servidor sin conexión a MongoDB.');
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

// 4. Crear una ruta de pureba para ver si el servidor responde
// Cuando aluien visite la raiz de tu backend (http://localhost:4000/),
// recivirá un mensaje JSON.
app.get('/', (req, res) => {
    res.json({mensaje: 'Mi servidor de catalinas responde'});
});

// Nota: no llamamos a `app.listen` aquí porque ya iniciamos el servidor
// dentro del `.then()` después de conectar a la base de datos. Esto evita
// intentar iniciar el servidor dos veces (y errores EADDRINUSE).