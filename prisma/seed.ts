import 'dotenv/config';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcrypt"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Iniciando seed...');

  // ── Limpiar en orden correcto (hijos antes que padres) ───────────────────
  await prisma.checklist_detalle_cuartel.deleteMany();
  await prisma.checklist_cuartel.deleteMany();
  await prisma.checklist_detalle.deleteMany();
  await prisma.checklist_detalle_bolso.deleteMany();
  await prisma.checklist_camiones_diario.deleteMany();
  await prisma.checklist_bolsos_emergencia.deleteMany();
  await prisma.camiones_inventario.deleteMany();
  await prisma.bolsos_inventario.deleteMany();
  await prisma.sectores_camion.deleteMany();
  await prisma.herramientas.deleteMany();
  await prisma.camiones.deleteMany();
  await prisma.bolsos.deleteMany();
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

  // ── Camiones (camiones de bomberos) ────────────────────────────────────────
  await prisma.camiones.createMany({
    data: [
      { id: 'camion_1', nombre_camion: 'Camión de Rescate 1', estado: 'ACTIVO' },
      { id: 'camion_2', nombre_camion: 'Camión de Incendio 1', estado: 'ACTIVO' },
      { id: 'camion_3', nombre_camion: 'Camión de apoyo', estado: 'ACTIVO' },
    ],
  });

  // ── Herramientas (inventario general del cuartel) ───────────────────────────
  await prisma.herramientas.createMany({
    data: [
      { id: 'herr_1', nombre_herramienta: 'Extintor 2.5kg', cantidad_disponible: 10 },
      { id: 'herr_2', nombre_herramienta: 'Manguera 70mm', cantidad_disponible: 20 },
      { id: 'herr_3', nombre_herramienta: 'Manguera 45mm', cantidad_disponible: 15 },
      { id: 'herr_4', nombre_herramienta: 'Hacha de bombero', cantidad_disponible: 8 },
      { id: 'herr_5', nombre_herramienta: 'Linterna táctica', cantidad_disponible: 12 },
      { id: 'herr_6', nombre_herramienta: 'Casco de bombero', cantidad_disponible: 6 },
      { id: 'herr_7', nombre_herramienta: 'Chaleco de seguridad', cantidad_disponible: 10 },
      { id: 'herr_8', nombre_herramienta: 'Pinza cortacables', cantidad_disponible: 4 },
      { id: 'herr_9', nombre_herramienta: 'Barrena de rescate', cantidad_disponible: 2 },
      { id: 'herr_10', nombre_herramienta: 'Rescatador de aguas', cantidad_disponible: 3 },
    ],
  });

  // ── Sectores de camiones (lugares/compartimentos) ────────────────────────
  await prisma.sectores_camion.createMany({
    data: [
      // Camión 1
      { id: 'sector_1', camion_id: 'camion_1', nombre_sector: 'Compartimento Lateral Izquierdo 1' },
      { id: 'sector_2', camion_id: 'camion_1', nombre_sector: 'Compartimento Lateral Izquierdo 2' },
      { id: 'sector_3', camion_id: 'camion_1', nombre_sector: 'Compartimento Lateral Derecho 1' },
      { id: 'sector_4', camion_id: 'camion_1', nombre_sector: 'Compartimento Trasero 1' },
      { id: 'sector_5', camion_id: 'camion_1', nombre_sector: 'Compartimento Trasero 2' },
      // Camión 2
      { id: 'sector_6', camion_id: 'camion_2', nombre_sector: 'Compartimento Lateral 1' },
      { id: 'sector_7', camion_id: 'camion_2', nombre_sector: 'Compartimento Lateral 2' },
      { id: 'sector_8', camion_id: 'camion_2', nombre_sector: 'Compartimento Superior' },
      // Camión 3
      { id: 'sector_9', camion_id: 'camion_3', nombre_sector: 'Compartimento Principal' },
      { id: 'sector_10', camion_id: 'camion_3', nombre_sector: 'Compartimento Secundario' },
    ],
  });

  // ── Inventario por camión (asignación de herramientas a sectores) ──────────
  await prisma.camiones_inventario.createMany({
    data: [
      { id: 'inv_1', camion_id: 'camion_1', sector_id: 'sector_1', herramienta_id: 'herr_1', cantidad_herramienta: 2 },
      { id: 'inv_2', camion_id: 'camion_1', sector_id: 'sector_2', herramienta_id: 'herr_2', cantidad_herramienta: 4 },
      { id: 'inv_3', camion_id: 'camion_1', sector_id: 'sector_3', herramienta_id: 'herr_3', cantidad_herramienta: 4 },
      { id: 'inv_4', camion_id: 'camion_1', sector_id: 'sector_4', herramienta_id: 'herr_4', cantidad_herramienta: 2 },
      { id: 'inv_5', camion_id: 'camion_1', sector_id: 'sector_5', herramienta_id: 'herr_5', cantidad_herramienta: 3 },
      { id: 'inv_6', camion_id: 'camion_2', sector_id: 'sector_6', herramienta_id: 'herr_2', cantidad_herramienta: 6 },
      { id: 'inv_7', camion_id: 'camion_2', sector_id: 'sector_7', herramienta_id: 'herr_3', cantidad_herramienta: 6 },
      { id: 'inv_8', camion_id: 'camion_2', sector_id: 'sector_8', herramienta_id: 'herr_1', cantidad_herramienta: 4 },
      { id: 'inv_9', camion_id: 'camion_3', sector_id: 'sector_9', herramienta_id: 'herr_6', cantidad_herramienta: 4 },
      { id: 'inv_10', camion_id: 'camion_3', sector_id: 'sector_10', herramienta_id: 'herr_7', cantidad_herramienta: 4 },
    ],
  });

  // ── Bolsos de emergencia ─────────────────────────────────────────────────
  await prisma.bolsos.createMany({
    data: [
      { id: 'bolso_1', nombre_bolso: 'Bolso de Trauma 1' },
      { id: 'bolso_2', nombre_bolso: 'Bolso de Trauma 2' },
      { id: 'bolso_3', nombre_bolso: 'Botiquín de Unidad' },
    ],
  });

  // ── Inventario de bolsos (herramientas asignadas a bolsos) ─────────────────
  await prisma.bolsos_inventario.createMany({
    data: [
      { id: 'bolso_inv_1', bolso_id: 'bolso_1', herramienta_id: 'herr_4', cantidad_herramienta: 2 },
      { id: 'bolso_inv_2', bolso_id: 'bolso_1', herramienta_id: 'herr_5', cantidad_herramienta: 3 },
      { id: 'bolso_inv_3', bolso_id: 'bolso_1', herramienta_id: 'herr_8', cantidad_herramienta: 1 },
      { id: 'bolso_inv_4', bolso_id: 'bolso_2', herramienta_id: 'herr_4', cantidad_herramienta: 2 },
      { id: 'bolso_inv_5', bolso_id: 'bolso_2', herramienta_id: 'herr_5', cantidad_herramienta: 2 },
      { id: 'bolso_inv_6', bolso_id: 'bolso_3', herramienta_id: 'herr_9', cantidad_herramienta: 1 },
      { id: 'bolso_inv_7', bolso_id: 'bolso_3', herramienta_id: 'herr_10', cantidad_herramienta: 2 },
    ],
  });
  // ── Checklist de Cuartel ──────────────────────────────────────────────
  const checklistId = 'checklist_cuartel_1';
  await prisma.checklist_cuartel.create({
    data: {
      id: checklistId,
      usuario_id: 'abc1',
      fecha_control: new Date(),
    },
  });

  await prisma.checklist_detalle_cuartel.createMany({
    data: [
      { id: 'check_detalle_1', checklist_id: checklistId, herramienta_id: 'herr_1', controlado: 'CHEQUEADO' },
      { id: 'check_detalle_2', checklist_id: checklistId, herramienta_id: 'herr_2', controlado: 'CHEQUEADO' },
      { id: 'check_detalle_3', checklist_id: checklistId, herramienta_id: 'herr_3', controlado: 'FALTANTE', observaciones: 'Falta una manguera en el deposito principal' },
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
