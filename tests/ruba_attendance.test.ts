import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';
import { tipos_respuesta } from '../generated/client';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-08/RUBA: Test de Integración - Verificación de Conteo de Asistencia RUBA', () => {
  let token: string;
  let createdAlertaId: string;
  const adminUserId = 'abc1'; // TEST_1_ADMIN
  const user2Id = 'abc2'; // TEST_2_USER
  const user3Id = 'abc3'; // TEST_3_USER

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({
        nombre_usuario: 'TEST_2_USER',
        password: 'TEST_1_PASSWORD'
      });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterEach(async () => {
    if (createdAlertaId) {
      await prisma.respuestas_alertas.deleteMany({
        where: { alerta_id: createdAlertaId }
      });
      await prisma.alerta.deleteMany({
        where: { id: createdAlertaId }
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Debería retornar el conteo exacto de asistencias RUBA considerando únicamente las respuestas "ACEPTADO"', async () => {
    createdAlertaId = randomUUID();

    await prisma.alerta.create({
      data: {
        id: createdAlertaId,
        sub_categoria_alerta_id: '1', // INCENDIO
        ubicacion: 'Calle de Prueba 999',
        observaciones: 'Simulación para conteo RUBA',
        fecha_hora: new Date(),
        estado_alerta_id: '1', // PENDIENTE
        usuario_alta_alerta: adminUserId
      }
    });

    // 3 respuestas con diferentes estados:
    // Admin (abc1): ACEPTADO → suma
    // User2 (abc2): RECHAZADO → no suma
    // User3 (abc3): PENDIENTE → no suma
    await prisma.respuestas_alertas.createMany({
      data: [
        {
          id: randomUUID(),
          alerta_id: createdAlertaId,
          usuario_id: adminUserId,
          estado_respuesta: 'ACEPTADO' as tipos_respuesta,
          fecha_hora: new Date()
        },
        {
          id: randomUUID(),
          alerta_id: createdAlertaId,
          usuario_id: user2Id,
          estado_respuesta: 'RECHAZADO' as tipos_respuesta,
          fecha_hora: new Date()
        },
        {
          id: randomUUID(),
          alerta_id: createdAlertaId,
          usuario_id: user3Id,
          estado_respuesta: 'PENDIENTE' as tipos_respuesta,
          fecha_hora: new Date()
        }
      ]
    });

    const res = await request(baseUrl)
      .get(`/respuestas_alertas/${createdAlertaId}/asistencias/count`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('cantidad');

    // Solo ACEPTADO califica como asistencia RUBA → debe ser 1
    expect(res.body.cantidad).toBe(1);
  });
});
