import 'dotenv/config';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcrypt"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Iniciando seed...');

  // ── Limpiar en orden correcto (hijos antes que padres) ───────────────────
  await prisma.registros_comunicacion.deleteMany();
  await prisma.respuestas_alertas.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.subcategoria_alerta.deleteMany();
  await prisma.categorias_alerta.deleteMany();
  await prisma.estados_alerta.deleteMany();
  await prisma.bomberos.deleteMany();
  await prisma.bomberos_rangos.deleteMany();
  await prisma.usuarios.deleteMany();



  await prisma.bomberos_rangos.createMany({
    data: [
      { id: 'CAD', nombre_rol: 'CADETE' },
      { id: 'OFI', nombre_rol: 'OFICIAL' },
      { id: 'BOM', nombre_rol: 'BOMBERO' },
    ],
  });

  // ── Categorías de alerta ─────────────────────────────────────────────────
  await prisma.categorias_alerta.createMany({
    data: [
      { id: '1', nombre_categoria: 'INCENDIO' },
      { id: '2', nombre_categoria: 'RESCATE' },
      { id: '3', nombre_categoria: 'OTRO' },
    ],
  });

  // ── Subcategorías (siempre después de sus categorías padre) ──────────────
  await prisma.subcategoria_alerta.createMany({
    data: [
      { id: '1', categoria_alerta_id: '1', nombre_sub_categoria: 'INCENDIO ESTRUCTURAL' },
      { id: '2', categoria_alerta_id: '2', nombre_sub_categoria: 'RESCATE AUTOMOVIL' },
      { id: '3', categoria_alerta_id: '3', nombre_sub_categoria: 'OTRO TIPO' },
    ],
  });

  // ── Estados de alerta ────────────────────────────────────────────────────
  await prisma.estados_alerta.createMany({
    data: [
      { id: '1', nombre_estado: 'PENDIENTE' },
      { id: '2', nombre_estado: 'EN CURSO' },
      { id: '3', nombre_estado: 'FINALIZADO' }
    ],
  });

  // ── Usuarios (necesarios antes de crear alertas por la FK usuario_alta_alerta) ──
  const passwordHash = await bcrypt.hash("TEST_1_PASSWORD", 10);

  await prisma.usuarios.createMany({
    data: [
      { id: 'abc1', nombre_usuario: 'TEST_1_ADMIN', password: passwordHash, rol: 'ADMIN' },
      { id: 'abc2', nombre_usuario: 'TEST_2_USER', password: passwordHash, rol: 'USER' },
      { id: 'abc3', nombre_usuario: 'TEST_3_USER', password: passwordHash, rol: 'USER' },
    ],
  });

  // ── Alertas (después de usuarios, subcategorías y estados) ───────────────
  await prisma.alerta.createMany({
    data: [
      { id: '1', sub_categoria_alerta_id: '1', ubicacion: 'TEST_1', observaciones: 'TEST_1', fecha_hora: new Date(), estado_alerta_id: '1', usuario_alta_alerta: 'abc1' },
      { id: '2', sub_categoria_alerta_id: '2', ubicacion: 'TEST_2', observaciones: 'TEST_2', fecha_hora: new Date(), estado_alerta_id: '2', usuario_alta_alerta: 'abc2' },
      { id: '3', sub_categoria_alerta_id: '3', ubicacion: 'TEST_3', observaciones: 'TEST_3', fecha_hora: new Date(), estado_alerta_id: '1', usuario_alta_alerta: 'abc3' },
    ],
  });

  // ── Bomberos (después de usuarios y rangos) ──────────────────────────────
  await prisma.bomberos.createMany({
    data: [
      { id: 'bombero_test_1', usuario_id: 'abc1', rango: 'BOM', nombre: 'BOMBERO_TEST', apellido: 'TEST' },
      { id: 'bombero_test_2', usuario_id: 'abc2', rango: 'CAD', nombre: 'CADETE_TEST', apellido: 'TEST' },
      { id: 'bombero_test_3', usuario_id: 'abc3', rango: 'OFI', nombre: 'OFICIAL_TEST', apellido: 'TEST' },
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
