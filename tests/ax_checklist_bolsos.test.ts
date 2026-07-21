import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-CHECKLIST_BOLSOS — Auditoría de seguridad y CRUD', () => {
  let adminToken: string;
  let adminId: string;
  let userToken: string;
  let userId: string;
  let createdChecklistId: string;
  let testAlertaId: string;
  let testBolsoId: string;
  let testBolsoInventarioId: string;
  let testHerramientaId: string;

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

    // Crear alerta PENDIENTE
    testAlertaId = randomUUID();
    await prisma.alerta.create({
      data: {
        id: testAlertaId,
        sub_categoria_alerta_id: '1',
        ubicacion: 'Test checklist bolsos',
        observaciones: 'Alerta de prueba para checklist bolsos',
        fecha_hora: new Date(),
        estado_alerta_id: '1',
        usuario_alta_alerta: adminId
      }
    });

    // Crear bolso via API
    const bolsoRes = await request(baseUrl)
      .post('/bolsos/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre_bolso: 'Bolso QA Test Checklist' });
    if (bolsoRes.status === 201) {
      testBolsoId = bolsoRes.body.id;
    }

    // Crear herramienta via API
    const herramientaRes = await request(baseUrl)
      .post('/herramientas/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre_herramienta: 'Herramienta QA Bolso', cantidad_disponible: 10 });
    if (herramientaRes.status === 201) {
      testHerramientaId = herramientaRes.body.id;
    }

    // Crear inventario de bolso via API
    if (testBolsoId && testHerramientaId) {
      const invRes = await request(baseUrl)
        .post('/bolsos_inventario')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bolsoId: testBolsoId, herramientaId: testHerramientaId, cantidad: 3 });
      if (invRes.status === 201) {
        testBolsoInventarioId = invRes.body.id;
      }
    }
  });

  afterAll(async () => {
    if (createdChecklistId) {
      await prisma.checklist_detalle_bolso.deleteMany({ where: { checklist_id: createdChecklistId } }).catch(() => {});
      await prisma.checklist_bolsos_emergencia.deleteMany({ where: { id: createdChecklistId } }).catch(() => {});
    }
    if (testAlertaId) {
      await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: testAlertaId } }).catch(() => {});
      await prisma.checklist_bolsos_emergencia.deleteMany({ where: { alerta_id: testAlertaId } }).catch(() => {});
      await prisma.alerta.deleteMany({ where: { id: testAlertaId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Autenticación — 401 sin token', () => {
    it('POST /checklist_bolsos/bolsos/guardar sin token retorna 401', async () => {
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .send({ bolsoId: 'bolso_1', alertaId: '1', detalles: [{ inventarioId: 'bolso_inv_1', controlado: 'CHEQUEADO' }] });
      expect(res.status).toBe(401);
    });

    it('GET /checklist_bolsos/bolsos/historial/:bolsoId sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/checklist_bolsos/bolsos/historial/bolso_1');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /checklist_bolsos/bolsos/guardar — Auditoría de seguridad (AX-13)', () => {
    it('usa usuarioId del JWT (req.user), NO del body', async () => {
      expect(testBolsoId).toBeTruthy();
      expect(testBolsoInventarioId).toBeTruthy();
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          bolsoId: testBolsoId,
          alertaId: testAlertaId,
          detalles: [{ inventarioId: testBolsoInventarioId, controlado: 'CHEQUEADO', observaciones: 'Test auditoría AX-13' }]
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('usuario_id', adminId);

      createdChecklistId = res.body.id;
    });
  });

  describe('POST /checklist_bolsos/bolsos/guardar — Validaciones', () => {
    it('sin bolsoId retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ alertaId: testAlertaId, detalles: [{ inventarioId: testBolsoInventarioId || 'dummy', controlado: 'CHEQUEADO' }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('bolsoId');
    });

    it('sin alertaId retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bolsoId: testBolsoId || 'dummy', detalles: [{ inventarioId: testBolsoInventarioId || 'dummy', controlado: 'CHEQUEADO' }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('alertaId');
    });

    it('detalles vacío retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bolsoId: 'bolso_1', alertaId: testAlertaId, detalles: [] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('vacío');
    });

    it('controlado inválido retorna 400', async () => {
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bolsoId: testBolsoId, alertaId: testAlertaId, detalles: [{ inventarioId: testBolsoInventarioId || 'dummy', controlado: 'INVALIDO' }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('controlado');
    });

    it('FALTANTE sin observaciones retorna 500 (validación del service)', async () => {
      const res = await request(baseUrl)
        .post('/checklist_bolsos/bolsos/guardar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ bolsoId: testBolsoId, alertaId: testAlertaId, detalles: [{ inventarioId: testBolsoInventarioId || 'dummy', controlado: 'FALTANTE' }] });
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /checklist_bolsos/bolsos/historial/:bolsoId', () => {
    it('retorna historial del bolso como array', async () => {
      const res = await request(baseUrl)
        .get(`/checklist_bolsos/bolsos/historial/${testBolsoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      if (createdChecklistId) {
        const found = res.body.find((c: any) => c.id === createdChecklistId);
        expect(found).toBeDefined();
        expect(found).toHaveProperty('usuarioId');
        expect(found.usuarioId).toHaveProperty('nombre_usuario');
        expect(found).toHaveProperty('alertaId');
        expect(found.alertaId).toHaveProperty('ubicacion');
      }
    });

    it('retorna array vacío para bolso sin registros', async () => {
      const res = await request(baseUrl)
        .get('/checklist_bolsos/bolsos/historial/bolso_id_inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
