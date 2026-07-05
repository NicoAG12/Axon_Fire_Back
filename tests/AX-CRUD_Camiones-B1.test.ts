import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-CRUD_Camiones-B1 — CRUD completo de Camiones', () => {
  let adminToken: string;
  let userToken: string;
  let createdCamionId: string;

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
    if (createdCamionId) {
      await prisma.camiones_inventario.deleteMany({ where: { camion_id: createdCamionId } }).catch(() => {});
      await prisma.sectores_camion.deleteMany({ where: { camion_id: createdCamionId } }).catch(() => {});
      await prisma.checklist_camiones_diario.deleteMany({ where: { camion_id: createdCamionId } }).catch(() => {});
      await prisma.camiones.deleteMany({ where: { id: createdCamionId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Autenticación y RBAC', () => {
    it('GET /camiones/ sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/camiones/');
      expect(res.status).toBe(401);
    });

    it('GET /camiones/ con token USER retorna 200', async () => {
      const res = await request(baseUrl)
        .get('/camiones/')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /camiones/', () => {
    it('retorna 200 con un array de camiones', async () => {
      const res = await request(baseUrl)
        .get('/camiones/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        const camion = res.body[0];
        expect(camion).toHaveProperty('id');
        expect(camion).toHaveProperty('nombre_camion');
        expect(camion).toHaveProperty('estado');
      }
    });
  });

  describe('GET /camiones/activos', () => {
    it('retorna 200 con solo camiones en estado ACTIVO', async () => {
      const res = await request(baseUrl)
        .get('/camiones/activos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      for (const camion of res.body) {
        expect(camion.estado).toBe('ACTIVO');
      }
    });
  });

  describe('POST /camiones/', () => {
    it('crea un camión y retorna 201 con los datos correctos', async () => {
      const res = await request(baseUrl)
        .post('/camiones/')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre_camion: 'Camión QA Test B1' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nombre_camion', 'Camión QA Test B1');
      expect(res.body).toHaveProperty('estado', 'ACTIVO');

      createdCamionId = res.body.id;
    });

    it('retorna 400 si falta nombre_camion', async () => {
      const res = await request(baseUrl)
        .post('/camiones/')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /camiones/:id', () => {
    it('retorna 200 con el camión creado', async () => {
      expect(createdCamionId).toBeTruthy();

      const res = await request(baseUrl)
        .get(`/camiones/${createdCamionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', createdCamionId);
      expect(res.body).toHaveProperty('nombre_camion', 'Camión QA Test B1');
      expect(res.body).toHaveProperty('estado', 'ACTIVO');
    });

    it('retorna 404 si el ID no existe', async () => {
      const res = await request(baseUrl)
        .get('/camiones/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Camión no encontrado');
    });
  });

  describe('PATCH /camiones/:id', () => {
    it('actualiza el nombre del camión y retorna 200', async () => {
      expect(createdCamionId).toBeTruthy();

      const res = await request(baseUrl)
        .patch(`/camiones/${createdCamionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre_camion: 'Camión QA Test B1 - Actualizado', estado: 'INACTIVO' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nombre_camion', 'Camión QA Test B1 - Actualizado');
      expect(res.body).toHaveProperty('estado', 'INACTIVO');
    });
  });

  describe('DELETE /camiones/:id', () => {
    it('elimina el camión y retorna 204', async () => {
      expect(createdCamionId).toBeTruthy();

      const res = await request(baseUrl)
        .delete(`/camiones/${createdCamionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const verifyRes = await request(baseUrl)
        .get(`/camiones/${createdCamionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(verifyRes.status).toBe(404);

      createdCamionId = '';
    });
  });
});
