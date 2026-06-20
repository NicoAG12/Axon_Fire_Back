import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 12 ────────────────────────────────────────────────────────────
// Verifica que el endpoint de conteo de asistencias solo contabilice
// respuestas con estado ACEPTADO. Las respuestas RECHAZADO y PENDIENTE
// no deben sumarse, porque el bombero no asistió efectivamente a la
// emergencia. Esto es esencial para la exactitud de los reportes RUBA.

describe('Test 12: RUBA — Conteo de asistencias (solo ACEPTADO)', () => {
  let token: string;

  // IDs creados durante el test (para limpieza)
  const idsCreados: string[] = [];

  beforeAll(async () => {
    // Arrange: iniciar sesión como usuario regular
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Limpieza: borrar respuestas primero, luego la alerta
    if (idsCreados.length > 0) {
      await prisma.respuestas_alertas.deleteMany({
        where: { alerta_id: { in: idsCreados } },
      });
      await prisma.alerta.deleteMany({
        where: { id: { in: idsCreados } },
      });
    }
    await prisma.$disconnect();
  });

  it('debería contar solo las respuestas ACEPTADO como asistencias RUBA', async () => {
    // Arrange: crear alerta y respuestas con distintos estados via Prisma
    const alertaId = randomUUID();

    await prisma.alerta.create({
      data: {
        id: alertaId,
        sub_categoria_alerta_id: '1',
        ubicacion: 'Test RUBA — Conteo de asistencias',
        observaciones: 'Simulación para test de conteo RUBA',
        fecha_hora: new Date(),
        estado_alerta_id: '1',
        usuario_alta_alerta: 'abc1',
      },
    });

    await prisma.respuestas_alertas.createMany({
      data: [
        {
          id: randomUUID(),
          alerta_id: alertaId,
          usuario_id: 'abc1',
          estado_respuesta: 'ACEPTADO',
          fecha_hora: new Date(),
        },
        {
          id: randomUUID(),
          alerta_id: alertaId,
          usuario_id: 'abc2',
          estado_respuesta: 'RECHAZADO',
          fecha_hora: new Date(),
        },
        {
          id: randomUUID(),
          alerta_id: alertaId,
          usuario_id: 'abc3',
          estado_respuesta: 'PENDIENTE',
          fecha_hora: new Date(),
        },
      ],
    });

    idsCreados.push(alertaId);

    // Act
    const res = await request(baseUrl)
      .get(`/respuestas_alertas/${alertaId}/asistencias/count`)
      .set('Authorization', `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cantidad');
    // Solo ACEPTADO califica como asistencia → el resultado debe ser 1
    expect(res.body.cantidad).toBe(1);
  });
});
