import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-15: Test de Generación de PDF de Informe de Emergencia', () => {
  let token: string;
  let createdAlertaId: string;

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    // Crear alerta FINALIZADA con datos completos para generar PDF
    createdAlertaId = randomUUID();
    const ahora = new Date();
    const hace3h = new Date(ahora.getTime() - 3 * 3600 * 1000);

    await prisma.alerta.create({
      data: {
        id: createdAlertaId,
        sub_categoria_alerta_id: '1',
        ubicacion: 'Av. Siempreviva 742, Springfield',
        observaciones: 'Incendio estructural en vivienda familiar. Se controló el foco ígneo sin víctimas.',
        fecha_hora: hace3h,
        fecha_hora_finalizacion: ahora,
        duracion_total_alerta: 10800000,
        estado_alerta_id: '3',
        usuario_alta_alerta: 'abc1'
      }
    });

    // Respuestas ACEPTADO para que aparezcan en el PDF
    await prisma.respuestas_alertas.createMany({
      data: [
        {
          id: randomUUID(),
          alerta_id: createdAlertaId,
          usuario_id: 'abc1',
          estado_respuesta: 'ACEPTADO',
          fecha_hora: hace3h
        },
        {
          id: randomUUID(),
          alerta_id: createdAlertaId,
          usuario_id: 'abc2',
          estado_respuesta: 'ACEPTADO',
          fecha_hora: hace3h
        }
      ]
    });
  });

  afterAll(async () => {
    if (createdAlertaId) {
      await prisma.informes_emergencia.deleteMany({ where: { alerta_id: createdAlertaId } });
      await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: createdAlertaId } });
      await prisma.alerta.deleteMany({ where: { id: createdAlertaId } });
    }
    await prisma.$disconnect();
  });

  it('GET /informes/:alertaId/pdf — Debería generar un PDF válido con los datos de la emergencia', async () => {
    const res = await request(baseUrl)
      .get(`/informes/${createdAlertaId}/pdf`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment; filename="informe_emergencia_');

    expect(Buffer.isBuffer(res.body) || typeof res.body === 'object').toBe(true);
    const pdfBuffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body);
    expect(pdfBuffer.slice(0, 5).toString()).toBe('%PDF-');
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it('GET /informes/:alertaId/pdf — Debería rechazar emergencias no finalizadas (estado PENDIENTE)', async () => {
    // alerta_1 del seed está en estado PENDIENTE
    const res = await request(baseUrl)
      .get('/informes/1/pdf')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Solo se pueden generar informes de emergencias finalizadas');
  });
});
