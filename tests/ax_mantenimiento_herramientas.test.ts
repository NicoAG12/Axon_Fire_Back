import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-MANTENIMIENTO_HERRAMIENTAS — CRUD y validaciones de Mantenimiento de Herramientas', () => {
  let adminToken: string;
  let userToken: string;
  let createdMantenimientoId: string;
  let testHerramientaId: string;

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

    // Crear herramienta de prueba para FK
    const herramientaRes = await request(baseUrl)
      .post('/herramientas/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre_herramienta: 'Motoherramienta QA Test', cantidad_disponible: 5 });
    if (herramientaRes.status === 201) {
      testHerramientaId = herramientaRes.body.id;
    }
  });

  afterAll(async () => {
    if (createdMantenimientoId) {
      await prisma.mantenimiento_herramientas.deleteMany({ where: { id: createdMantenimientoId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Autenticación — 401 sin token', () => {
    it('POST /mantenimiento_herramientas/guardar sin token retorna 401', async () => {
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .send({ herramientaId: 'dummy', nivel_aceite: 'OK', estado_mangueras: 'OK', presion_trabajo: 'OK', estado_limpieza: 'OK' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('GET /mantenimiento_herramientas/historial/:herramientaId sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/mantenimiento_herramientas/historial/dummy');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /mantenimiento_herramientas/guardar — Validaciones de campos', () => {
    it('sin herramientaId retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nivel_aceite: 'OK', estado_mangueras: 'OK', presion_trabajo: 'OK', estado_limpieza: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('herramientaId');
    });

    it('nivel_aceite inválido retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ herramientaId: 'dummy', nivel_aceite: 'INVALIDO', estado_mangueras: 'OK', presion_trabajo: 'OK', estado_limpieza: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('nivel_aceite');
    });

    it('estado_mangueras inválido retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ herramientaId: 'dummy', nivel_aceite: 'OK', estado_mangueras: 'ROTO', presion_trabajo: 'OK', estado_limpieza: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('estado_mangueras');
    });

    it('presion_trabajo inválido retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ herramientaId: 'dummy', nivel_aceite: 'OK', estado_mangueras: 'OK', presion_trabajo: 'NO_EXISTE', estado_limpieza: 'OK' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('presion_trabajo');
    });

    it('estado_limpieza inválido retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ herramientaId: 'dummy', nivel_aceite: 'OK', estado_mangueras: 'OK', presion_trabajo: 'OK', estado_limpieza: 'SUCIO' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('estado_limpieza');
    });

    it('todos los campos válidos crea el registro exitosamente', async () => {
      expect(testHerramientaId).toBeTruthy();
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          herramientaId: testHerramientaId,
          nivel_aceite: 'OK',
          estado_mangueras: 'OK',
          presion_trabajo: 'OK',
          estado_limpieza: 'OK',
          observaciones: 'Mantenimiento preventivo semanal'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('herramienta_id', testHerramientaId);
      expect(res.body).toHaveProperty('nivel_aceite', 'OK');
      expect(res.body).toHaveProperty('estado_mangueras', 'OK');
      expect(res.body).toHaveProperty('presion_trabajo', 'OK');
      expect(res.body).toHaveProperty('estado_limpieza', 'OK');
      expect(res.body).toHaveProperty('observaciones', 'Mantenimiento preventivo semanal');

      createdMantenimientoId = res.body.id;
    });

    it('permite valores DANADO, DESVIACION, REQUIERE_LIMPIEZA', async () => {
      expect(testHerramientaId).toBeTruthy();
      const res = await request(baseUrl)
        .post('/mantenimiento_herramientas/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          herramientaId: testHerramientaId,
          nivel_aceite: 'BAJO',
          estado_mangueras: 'DANADO',
          presion_trabajo: 'DESVIACION',
          estado_limpieza: 'REQUIERE_LIMPIEZA',
          observaciones: 'Requiere reparación urgente'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('nivel_aceite', 'BAJO');
      expect(res.body).toHaveProperty('estado_mangueras', 'DANADO');
      expect(res.body).toHaveProperty('presion_trabajo', 'DESVIACION');
      expect(res.body).toHaveProperty('estado_limpieza', 'REQUIERE_LIMPIEZA');

      await prisma.mantenimiento_herramientas.deleteMany({ where: { id: res.body.id } }).catch(() => {});
    });
  });

  describe('GET /mantenimiento_herramientas/historial/:herramientaId', () => {
    it('retorna historial de la herramienta como array', async () => {
      expect(testHerramientaId).toBeTruthy();
      const res = await request(baseUrl)
        .get(`/mantenimiento_herramientas/historial/${testHerramientaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (createdMantenimientoId) {
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        const found = res.body.find((m: any) => m.id === createdMantenimientoId);
        expect(found).toBeDefined();
        expect(found).toHaveProperty('usuarioId');
        expect(found.usuarioId).toHaveProperty('nombre_usuario');
      }
    });

    it('retorna array vacío para herramienta sin registros', async () => {
      const res = await request(baseUrl)
        .get('/mantenimiento_herramientas/historial/herr_id_inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
