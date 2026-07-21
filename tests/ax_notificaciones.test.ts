import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-NOTIFICACIONES — Registro de token, seguridad y consulta', () => {
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;

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
  });

  afterAll(async () => {
    await prisma.tokens_dispositivos.deleteMany({ where: { usuario_id: adminId } }).catch(() => {});
    await prisma.tokens_dispositivos.deleteMany({ where: { usuario_id: userId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe('POST /notificaciones/registrar-token', () => {
    it('sin token de autenticación retorna 401', async () => {
      const res = await request(baseUrl)
        .post('/notificaciones/registrar-token')
        .send({ usuario_id: adminId, token: 'ExpoToken-Test-123', plataforma: 'ios' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('registra token exitosamente para el mismo usuario del JWT', async () => {
      const res = await request(baseUrl)
        .post('/notificaciones/registrar-token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ usuario_id: adminId, token: 'ExpoToken-Test-123', plataforma: 'ios' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token', 'ExpoToken-Test-123');
      expect(res.body).toHaveProperty('usuario_id', adminId);
      expect(res.body).toHaveProperty('plataforma', 'ios');
    });

    it('ROJO — suplantación: body usuario_id diferente al JWT retorna 403', async () => {
      const res = await request(baseUrl)
        .post('/notificaciones/registrar-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ usuario_id: adminId, token: 'ExpoToken-Spoof-456', plataforma: 'android' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('No puede registrar tokens para otro usuario');
    });

    it('upsert: registrar mismo token actualiza usuario/plataforma', async () => {
      const res = await request(baseUrl)
        .post('/notificaciones/registrar-token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ usuario_id: adminId, token: 'ExpoToken-Test-123', plataforma: 'android' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token', 'ExpoToken-Test-123');
      expect(res.body).toHaveProperty('plataforma', 'android');
    });
  });

  describe('GET /notificaciones/mis-tokens', () => {
    it('sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/notificaciones/mis-tokens');
      expect(res.status).toBe(401);
    });

    it('retorna los tokens del usuario autenticado', async () => {
      const res = await request(baseUrl)
        .get('/notificaciones/mis-tokens')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const found = res.body.find((t: any) => t.token === 'ExpoToken-Test-123');
      expect(found).toBeDefined();
      expect(found).toHaveProperty('plataforma', 'android');
    });

    it('usuario sin tokens recibe array vacío', async () => {
      const res = await request(baseUrl)
        .get('/notificaciones/mis-tokens')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
