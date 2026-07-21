import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-CONTROL_FLUIDOS — CRUD y validaciones de Control de Fluidos', () => {
  let adminToken: string;
  let userToken: string;
  let createdControlId: string;
  let testCamionId: string;

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

    // Crear camión de prueba para FK
    const camionRes = await request(baseUrl)
      .post('/camiones/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre_camion: 'Camión QA Test Fluidos', estado: 'ACTIVO' });
    if (camionRes.status === 201) {
      testCamionId = camionRes.body.id;
    }
  });

  afterAll(async () => {
    if (createdControlId) {
      await prisma.control_fluidos.deleteMany({ where: { id: createdControlId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Autenticación — 401 sin token', () => {
    it('POST /control_fluidos/guardar sin token retorna 401', async () => {
      const res = await request(baseUrl)
        .post('/control_fluidos/guardar')
        .send({ camionId: 'dummy', aceite_motor: 'OK', liquido_refrigerante: 'OK', liquido_frenos: 'OK', liquido_direccion: 'OK' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('GET /control_fluidos/historial/:camionId sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/control_fluidos/historial/dummy');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /control_fluidos/guardar — Validaciones de campos', () => {
    it('campos faltantes (sin aceite_motor) retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/control_fluidos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ camionId: 'dummy', liquido_refrigerante: 'OK', liquido_frenos: 'OK', liquido_direccion: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('sin camionId retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/control_fluidos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ aceite_motor: 'OK', liquido_refrigerante: 'OK', liquido_frenos: 'OK', liquido_direccion: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('camionId');
    });

    it('valor inválido en aceite_motor retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/control_fluidos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ camionId: 'dummy', aceite_motor: 'MAL', liquido_refrigerante: 'OK', liquido_frenos: 'OK', liquido_direccion: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('aceite_motor');
    });

    it('todos los campos OK crea el registro exitosamente', async () => {
      expect(testCamionId).toBeTruthy();
      const res = await request(baseUrl)
        .post('/control_fluidos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          camionId: testCamionId,
          aceite_motor: 'OK',
          liquido_refrigerante: 'OK',
          liquido_frenos: 'BAJO',
          liquido_direccion: 'CRITICO',
          observaciones: 'Control semanal de fluidos'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('camion_id', testCamionId);
      expect(res.body).toHaveProperty('aceite_motor', 'OK');
      expect(res.body).toHaveProperty('liquido_frenos', 'BAJO');
      expect(res.body).toHaveProperty('liquido_direccion', 'CRITICO');
      expect(res.body).toHaveProperty('observaciones', 'Control semanal de fluidos');

      createdControlId = res.body.id;
    });
  });

  describe('GET /control_fluidos/historial/:camionId', () => {
    it('retorna historial del camión como array', async () => {
      expect(testCamionId).toBeTruthy();
      const res = await request(baseUrl)
        .get(`/control_fluidos/historial/${testCamionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (createdControlId) {
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        const found = res.body.find((c: any) => c.id === createdControlId);
        expect(found).toBeDefined();
        expect(found).toHaveProperty('usuarioId');
        expect(found.usuarioId).toHaveProperty('nombre_usuario');
      }
    });

    it('retorna array vacío para camión sin registros', async () => {
      const res = await request(baseUrl)
        .get('/control_fluidos/historial/camion_id_inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
