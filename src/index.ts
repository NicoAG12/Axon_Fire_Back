import express from 'express';
import 'dotenv/config';
import { prisma } from './lib/prisma';
import { verificarHeaders } from './middlewares/auth.middleware';

import rutasUsuarios from './routes/user.routes';
import rutaAuth from './routes/auth.route'
import rutaAlerta from './routes/alerta.route'
import rutaRespuestasAlertas from './routes/respuestas_alertas.route'
import rutaNotificaciones from './routes/notificaciones.route'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function main() {
  try {
    // 1. Verificar conexión con la DB
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL correctamente');

    // 2. Asociar nuestras rutas a Express
    app.use('/usuarios', verificarHeaders, rutasUsuarios);
    app.use('/auth', rutaAuth);
    app.use('/alerta', rutaAlerta);
    app.use('/respuestas_alertas', rutaRespuestasAlertas);
    app.use('/notificaciones', rutaNotificaciones);

    // 3. Poner el servidor a escuchar peticiones
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

main();

// Cierre limpio de la conexión al terminar el proceso
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Conexión cerrada correctamente');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
