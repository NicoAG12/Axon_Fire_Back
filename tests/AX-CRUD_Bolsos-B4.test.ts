import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-CRUD_Bolsos-B4 — CRUD completo de Bolsos', () => {
  let adminToken: string;
  let userToken: string;
  let createdBolsoId: string;

  beforeAll(async () => {
    const loginAdmin = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginAdmin.status).toBe(200);
    adminToken = loginAdmin.body.token;

    const loginUser = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginUser.status).toBe(200);
    userToken = loginUser.body.token;
  });

  afterAll(async () => {
    if (createdBolsoId) {
      await prisma.bolsos_inventario.deleteMany({ where: { bolso_id: createdBolsoId } }).catch(() => {});
      await prisma.checklist_bolsos_emergencia.deleteMany({ where: { bolso_id: createdBolsoId } }).catch(() => {});
      await prisma.bolsos.deleteMany({ where: { id: createdBolsoId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Autenticación y RBAC', () => {
    it('GET /bolsos/ sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/bolsos/');
      expect(res.status).toBe(401);
    });

    it('GET /bolsos/ con token USER retorna 200', async () => {
      const res = await request(baseUrl)
        .get('/bolsos/')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /bolsos/', () => {
    it('retorna 200 con un array de bolsos', async () => {
      const res = await request(baseUrl)
        .get('/bolsos/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        const bolso = res.body[0];
        expect(bolso).toHaveProperty('id');
        expect(bolso).toHaveProperty('nombre_bolso');
      }
    });
  });

  describe('POST /bolsos/', () => {
    it('crea un bolso y retorna 201 con los datos correctos', async () => {
      const res = await request(baseUrl)
        .post('/bolsos/')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre_bolso: 'Bolso QA Test B4' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nombre_bolso', 'Bolso QA Test B4');

      createdBolsoId = res.body.id;
    });

    it('retorna 400 si falta nombre_bolso', async () => {
      const res = await request(baseUrl)
        .post('/bolsos/')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /bolsos/:id', () => {
    it('retorna 200 con el bolso creado', async () => {
      expect(createdBolsoId).toBeTruthy();

      const res = await request(baseUrl)
        .get(`/bolsos/${createdBolsoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', createdBolsoId);
      expect(res.body).toHaveProperty('nombre_bolso', 'Bolso QA Test B4');
    });

    it('retorna 404 si el ID no existe', async () => {
      const res = await request(baseUrl)
        .get('/bolsos/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Bolso no encontrado');
    });
  });

  describe('PATCH /bolsos/:id', () => {
    it('actualiza el nombre del bolso y retorna 200', async () => {
      expect(createdBolsoId).toBeTruthy();

      const res = await request(baseUrl)
        .patch(`/bolsos/${createdBolsoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre_bolso: 'Bolso QA Test B4 - Actualizado' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nombre_bolso', 'Bolso QA Test B4 - Actualizado');
    });
  });

  describe('DELETE /bolsos/:id', () => {
    it('elimina el bolso y retorna 204', async () => {
      expect(createdBolsoId).toBeTruthy();

      const res = await request(baseUrl)
        .delete(`/bolsos/${createdBolsoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const verifyRes = await request(baseUrl)
        .get(`/bolsos/${createdBolsoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(verifyRes.status).toBe(404);

      createdBolsoId = '';
    });
  });
});
