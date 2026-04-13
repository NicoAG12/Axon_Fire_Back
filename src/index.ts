import 'dotenv/config';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Verificar conexión con la DB
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL correctamente');

    // Tu lógica de servidor va acá (express, fastify, etc.)
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
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
