import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-17: Exactitud Conteo RUBA - Verificación Matemática de Horas', () => {
  let adminToken: string;
  const createdAlertas: string[] = [];
  const adminUserId = 'abc1';
  const user2Id = 'abc2';

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;

    // Limpiar datos residuales de ejecuciones anteriores (forceExit puede cortar afterAll)
    const residuales = await prisma.alerta.findMany({ where: { ubicacion: { startsWith: 'Test RUBA horas' } }, select: { id: true } });
    for (const r of residuales) {
      await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: r.id } });
      await prisma.alerta.delete({ where: { id: r.id } });
    }

    // Obtener mes/año actual para crear alertas en el mismo período
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth();

    const crearAlertaConDuracion = async (duracionMs: number, usuarios: string[]) => {
      const alertaId = randomUUID();
      createdAlertas.push(alertaId);

      const fin = new Date();
      const inicio = new Date(fin.getTime() - duracionMs);

      await prisma.alerta.create({
        data: {
          id: alertaId,
          sub_categoria_alerta_id: '1',
          ubicacion: `Test RUBA horas - ${alertaId.substring(0, 6)}`,
          observaciones: 'Alerta para verificación matemática de horas RUBA',
          fecha_hora: inicio,
          fecha_hora_finalizacion: fin,
          duracion_total_alerta: duracionMs,
          estado_alerta_id: '3',
          usuario_alta_alerta: adminUserId,
        }
      });

      for (const uid of usuarios) {
        await prisma.respuestas_alertas.create({
          data: {
            id: randomUUID(),
            alerta_id: alertaId,
            usuario_id: uid,
            estado_respuesta: 'ACEPTADO',
            fecha_hora: inicio,
          }
        });
      }
    };

    // Alerta 1: 2 horas exactas => duracion_total_alerta = 7,200,000 ms
    await crearAlertaConDuracion(7_200_000, [adminUserId]);
    // Alerta 2: 1.5 horas = 5,400,000 ms — con usuario adicional
    await crearAlertaConDuracion(5_400_000, [adminUserId, user2Id]);
    // Alerta 3: 30 minutos = 1,800,000 ms — solo user2
    await crearAlertaConDuracion(1_800_000, [user2Id]);
  });

  afterAll(async () => {
    // Doble limpieza: por lista + por patrón (cubre datos residuales si forceExit cortó la limpieza anterior)
    for (const id of createdAlertas) {
      await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: id } });
      await prisma.alerta.deleteMany({ where: { id } });
    }
    const residuales = await prisma.alerta.findMany({ where: { ubicacion: { startsWith: 'Test RUBA horas' } }, select: { id: true } });
    for (const r of residuales) {
      await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: r.id } });
      await prisma.alerta.delete({ where: { id: r.id } });
    }
    await prisma.$disconnect();
  });

  it('Los total_horas deben coincidir exactamente con la suma matemática de duraciones de emergencias finalizadas', async () => {
    const ahora = new Date();
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    const res = await request(baseUrl)
      .get(`/metricas/mensuales?mes=${mes}&anio=${anio}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bomberos');
    expect(Array.isArray(res.body.bomberos)).toBe(true);

    // Cálculos matemáticos esperados:
    // Admin (abc1): alerta_1 (2h) + alerta_2 (1.5h) = 3.5h
    const horasEsperadasAdmin = Math.round((7_200_000 + 5_400_000) / 3_600_000 * 100) / 100;
    const asistenciasEsperadasAdmin = 2;

    // User2 (abc2): alerta_2 (1.5h) + alerta_3 (0.5h) = 2.0h
    const horasEsperadasUser2 = Math.round((5_400_000 + 1_800_000) / 3_600_000 * 100) / 100;
    const asistenciasEsperadasUser2 = 2;

    const bomberoAdmin = res.body.bomberos.find((b: any) => b.usuario_id === adminUserId);
    expect(bomberoAdmin).toBeDefined();
    expect(bomberoAdmin.total_horas).toBe(horasEsperadasAdmin);
    expect(bomberoAdmin.total_asistencias).toBe(asistenciasEsperadasAdmin);

    const bomberoUser2 = res.body.bomberos.find((b: any) => b.usuario_id === user2Id);
    expect(bomberoUser2).toBeDefined();
    expect(bomberoUser2.total_horas).toBe(horasEsperadasUser2);
    expect(bomberoUser2.total_asistencias).toBe(asistenciasEsperadasUser2);

    console.warn(
      `[EXACTITUD RUBA VALIDADA]: Admin=${bomberoAdmin.total_horas}h/${bomberoAdmin.total_asistencias} asistencias ` +
      `(esperado ${horasEsperadasAdmin}h/${asistenciasEsperadasAdmin}) | ` +
      `User2=${bomberoUser2.total_horas}h/${bomberoUser2.total_asistencias} asistencias ` +
      `(esperado ${horasEsperadasUser2}h/${asistenciasEsperadasUser2})`
    );
  });
});
