import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { verificarHeaders } from './middlewares/auth.middleware';

import rutasUsuarios from './routes/user.routes';
import rutaAuth from './routes/auth.route'
import rutaAlerta from './routes/alerta.route'
import rutaRespuestasAlertas from './routes/respuestas_alertas.route'
import rutaNotificaciones from './routes/notificaciones.route'
import rutaRegistrosComunicacion from './routes/registros_comunicacion.route'
import rutaHerramientas from './routes/herramientas.route'
import rutaCamiones from './routes/camiones.route'
import rutaSectores from './routes/sectores.route'
import rutaCamionesInventario from './routes/camiones_inventario.route'
import rutaBolsos from './routes/bolsos.route'
import rutaBolsosInventario from './routes/bolsos_inventario.route'
import rutaChecklist from './routes/checklist.route'
import rutaChecklistBolsos from './routes/checklist_bolsos.route'
import rutaChecklistCuartel from './routes/checklist_cuartel.route'
import rutaSeed from './routes/seed.route'
import rutaMetricas from './routes/metricas.route'
import rutaInformes from './routes/informes.route'

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(cors());

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
    app.use('/registros_comunicacion', rutaRegistrosComunicacion);
    app.use('/notificaciones', rutaNotificaciones);
    app.use('/herramientas', verificarHeaders, rutaHerramientas);
    app.use('/camiones', verificarHeaders, rutaCamiones);
    app.use('/sectores', verificarHeaders, rutaSectores);
    app.use('/camiones_inventario', verificarHeaders, rutaCamionesInventario);
    app.use('/bolsos', verificarHeaders, rutaBolsos);
    app.use('/bolsos_inventario', verificarHeaders, rutaBolsosInventario);
    app.use('/checklist', verificarHeaders, rutaChecklist);
    app.use('/checklist_bolsos', verificarHeaders, rutaChecklistBolsos);
    app.use('/checklist_cuartel', verificarHeaders, rutaChecklistCuartel);
    app.use('/seed', rutaSeed);
    app.use('/metricas', rutaMetricas);
    app.use('/informes', rutaInformes);

    // 3. Poner el servidor a escuchar peticiones
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor Express corriendo en http://localhost:${PORT}`);
      console.log(`   Y accesible desde la red en http://0.0.0.0:${PORT}`);
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
