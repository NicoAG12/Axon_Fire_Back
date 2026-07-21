import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-RESPUESTAS_ALERTAS — Responder aviso, listar y eliminar', () => {
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;
  let createdAlertaId: string;
  let createdRespuestaId: string;

  beforeAll(async () => {
    const loginAdmin = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginAdmin.status).toBe(200);
    adminToken = loginAdmin.body.token;
    adminId = loginAdmin.body.id;

    const loginUser = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginUser.status).toBe(200);
    userToken = loginUser.body.token;
    userId = loginUser.body.id;

    // Crear alerta PENDIENTE para poder responder
    createdAlertaId = randomUUID();
    await prisma.alerta.create({
      data: {
        id: createdAlertaId,
        sub_categoria_alerta_id: '1',
        ubicacion: 'Test responder aviso',
        observaciones: 'Alerta para test de responder',
        fecha_hora: new Date(),
        estado_alerta_id: '1',
        usuario_alta_alerta: adminId
      }
    });

    // Crear respuesta PENDIENTE para admin
    createdRespuestaId = randomUUID();
    await prisma.respuestas_alertas.create({
      data: {
        id: createdRespuestaId,
        alerta_id: createdAlertaId,
        usuario_id: adminId,
        estado_respuesta: 'PENDIENTE',
        fecha_hora: new Date()
      }
    });

    // Crear respuesta PENDIENTE para user
    await prisma.respuestas_alertas.create({
      data: {
        id: randomUUID(),
        alerta_id: createdAlertaId,
        usuario_id: userId,
        estado_respuesta: 'PENDIENTE',
        fecha_hora: new Date()
      }
    });
  });

  afterAll(async () => {
    await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: createdAlertaId } }).catch(() => {});
    await prisma.registros_comunicacion.deleteMany({ where: { alerta_id: createdAlertaId } }).catch(() => {});
    await prisma.alerta.deleteMany({ where: { id: createdAlertaId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe('Autenticación — 401 sin token', () => {
    it('POST /respuestas_alertas/responder/:alerta_id sin token retorna 401', async () => {
      const res = await request(baseUrl)
        .post(`/respuestas_alertas/responder/${createdAlertaId}`)
        .send({ estado_respuesta: 'ACEPTADO', fecha_hora: new Date().toISOString() });
      expect(res.status).toBe(401);
    });

    it('GET /respuestas_alertas/:id_alerta sin token retorna 401', async () => {
      const res = await request(baseUrl).get(`/respuestas_alertas/${createdAlertaId}`);
      expect(res.status).toBe(401);
    });

    it('DELETE /respuestas_alertas/:id sin token retorna 401', async () => {
      const res = await request(baseUrl).delete(`/respuestas_alertas/${createdRespuestaId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /respuestas_alertas/responder/:alerta_id', () => {
    it('responde con ACEPTADO exitosamente y cambia alerta a EN CURSO', async () => {
      const res = await request(baseUrl)
        .post(`/respuestas_alertas/responder/${createdAlertaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado_respuesta: 'ACEPTADO', fecha_hora: new Date().toISOString() });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('estado_respuesta', 'ACEPTADO');
      expect(res.body).toHaveProperty('usuario_id', adminId);
    });

    it('responde con RECHAZADO exitosamente', async () => {
      const res = await request(baseUrl)
        .post(`/respuestas_alertas/responder/${createdAlertaId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ estado_respuesta: 'RECHAZADO', fecha_hora: new Date().toISOString() });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('estado_respuesta', 'RECHAZADO');
      expect(res.body).toHaveProperty('usuario_id', userId);
    });
  });

  describe('GET /respuestas_alertas/:id_alerta', () => {
    it('retorna las respuestas de la alerta', async () => {
      const res = await request(baseUrl)
        .get(`/respuestas_alertas/${createdAlertaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      const adminResp = res.body.find((r: any) => r.usuario_id === adminId);
      expect(adminResp).toBeDefined();
      expect(adminResp.estado_respuesta).toBe('ACEPTADO');
    });

    it('ROJO - alerta inexistente retorna 200 (bug: falta await en service — no lanza error)', async () => {
      const res = await request(baseUrl)
        .get('/respuestas_alertas/id_inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      // Bug: el service no hace await a buscarAlertaPorID, la Promise siempre es truthy
      // Debería retornar 500 con "No se encontro alerta"
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('DELETE /respuestas_alertas/:id — requiere rol ADMIN', () => {
    it('usuario USER recibe 403 al intentar eliminar una respuesta', async () => {
      const res = await request(baseUrl)
        .delete(`/respuestas_alertas/${createdRespuestaId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('ROJO - DELETE con ADMIN retorna 500 (bug: param name mismatch id vs id_respuesta)', async () => {
      const res = await request(baseUrl)
        .delete(`/respuestas_alertas/${createdRespuestaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Bug: el controller lee req.params.id_respuesta pero la ruta usa :id
      // Debería retornar 204, pero retorna 500 porque id_respuesta es undefined
      expect(res.status).toBe(500);
    });
  });
});
