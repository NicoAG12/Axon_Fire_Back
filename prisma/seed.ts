import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Limpia la tabla antes de insertar (opcional)
  await prisma.user.deleteMany();

  // Insertar datos de ejemplo
  await prisma.user.createMany({
    data: [
      { email: 'admin@axionfire.com', name: 'Admin' },
      { email: 'usuario@axionfire.com', name: 'Usuario Demo' },
    ],
  });

  console.log('✅ Seed completado');
}

seed()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
