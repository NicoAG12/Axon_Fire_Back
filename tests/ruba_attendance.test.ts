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
    // 1. Obtener JWT legítimo para autorizar las peticiones
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
    // 2. Limpieza de datos creados en el test para no ensuciar la base de datos
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

    // 1. Insertar una alerta de prueba
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

    // 2. Insertar 3 respuestas controladas para esta alerta:
    // - Usuario 1 (admin): ACEPTADO (Debe sumarse al conteo)
    // - Usuario 2 (user2): RECHAZADO (No debe sumarse)
    // - Usuario 3 (user3): PENDIENTE (No debe sumarse)
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

    // 3. Consumir el endpoint de conteo de asistencia RUBA
    const res = await request(baseUrl)
      .get(`/respuestas_alertas/${createdAlertaId}/asistencias/count`)
      .set('Authorization', `Bearer ${token}`);

    // 4. Validaciones de exactitud
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('cantidad');
    
    // El total debe ser exactamente 1 (únicamente la respuesta 'ACEPTADO' califica como asistencia RUBA)
    expect(res.body.cantidad).toBe(1);

    console.warn(`[CONTEO RUBA VALIDADO]: La API reportó exactamente ${res.body.cantidad} asistentes (Esperado: 1). Conteo 100% exacto.`);
  });
});
