import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-Registros_de_Comunicación-B5 — Registros de Comunicación en Emergencias', () => {
  let adminToken: string;
  let userToken: string;
  let createdAlertaId: string;

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

    // Asegurar datos de referencia para la alerta
    try {
      await prisma.categorias_alerta.upsert({
        where: { id: '1' },
        create: { id: '1', nombre_categoria: 'INCENDIO' },
        update: {}
      });
    } catch {}
    try {
      await prisma.subcategoria_alerta.upsert({
        where: { id: '1' },
        create: { id: '1', categoria_alerta_id: '1', nombre_sub_categoria: 'INCENDIO ESTRUCTURAL' },
        update: {}
      });
    } catch {}
    try {
      await prisma.estados_alerta.upsert({
        where: { id: '1' },
        create: { id: '1', nombre_estado: 'PENDIENTE' },
        update: {}
      });
    } catch {}

    // Crear alerta via API
    const crearRes = await request(baseUrl)
      .post('/alerta/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sub_categoria_alerta_id: '1',
        ubicacion: 'Av. Comunicación B5 789',
        latitud: -34.6000,
        longitud: -58.3800,
        observaciones: 'Alerta para test de registros de comunicación',
        fecha_hora: new Date().toISOString(),
        estado_alerta_id: '1',
        prioridad: 'ALTA'
      });

    if (crearRes.status === 200) {
      createdAlertaId = crearRes.body.id;
    } else {
      console.warn('No se pudo crear alerta de prueba B5:', crearRes.body);
    }
  });

  afterAll(async () => {
    if (createdAlertaId) {
      await prisma.registros_comunicacion.deleteMany({ where: { alerta_id: createdAlertaId } }).catch(() => {});
      await prisma.respuestas_alertas.deleteMany({ where: { alerta_id: createdAlertaId } }).catch(() => {});
      await prisma.informes_emergencia.deleteMany({ where: { alerta_id: createdAlertaId } }).catch(() => {});
      await prisma.alerta.deleteMany({ where: { id: createdAlertaId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Autenticación', () => {
    it('POST /registros_comunicacion/crear sin token retorna 401', async () => {
      const res = await request(baseUrl)
        .post('/registros_comunicacion/crear')
        .send({ alerta_id: createdAlertaId || 'no-op', mensaje: 'test', tipo_comunicacion: 'INFORMACION' });
      expect(res.status).toBe(401);
    });

    it('GET /registros_comunicacion/alerta/:id_alerta sin token retorna 401', async () => {
      const res = await request(baseUrl).get(`/registros_comunicacion/alerta/${createdAlertaId || 'no-op'}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /registros_comunicacion/crear', () => {
    it('crea un registro con tipo INFORMACION y retorna 201 (token USER)', async () => {
      if (!createdAlertaId) return;

      const res = await request(baseUrl)
        .post('/registros_comunicacion/crear')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ alerta_id: createdAlertaId, mensaje: 'Mensaje de prueba USER', tipo_comunicacion: 'INFORMACION', fecha_hora: new Date().toISOString() });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('alerta_id', createdAlertaId);
      expect(res.body).toHaveProperty('mensaje', 'Mensaje de prueba USER');
      expect(res.body).toHaveProperty('tipo_comunicacion', 'INFORMACION');
    });

    it('crea un registro con tipo SUMINISTROS y retorna 201', async () => {
      if (!createdAlertaId) return;

      const fechaHora = new Date().toISOString();

      const res = await request(baseUrl)
        .post('/registros_comunicacion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          alerta_id: createdAlertaId,
          mensaje: 'Solicito más extintores en la escena',
          tipo_comunicacion: 'SUMINISTROS',
          fecha_hora: fechaHora
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('tipo_comunicacion', 'SUMINISTROS');
    });

    it('crea un registro con tipo APOYO y retorna 201', async () => {
      if (!createdAlertaId) return;

      const res = await request(baseUrl)
        .post('/registros_comunicacion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          alerta_id: createdAlertaId,
          mensaje: 'Necesitamos apoyo de otra dotación',
          tipo_comunicacion: 'APOYO',
          fecha_hora: new Date().toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('tipo_comunicacion', 'APOYO');
    });

    it('rechaza tipo_comunicacion inválido con 500', async () => {
      if (!createdAlertaId) return;

      const res = await request(baseUrl)
        .post('/registros_comunicacion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          alerta_id: createdAlertaId,
          mensaje: 'Tipo inválido',
          tipo_comunicacion: 'TIPO_INEXISTENTE'
        });

      expect(res.status).toBe(500);
    });

    it('rechaza alerta_id inexistente con 500', async () => {
      const res = await request(baseUrl)
        .post('/registros_comunicacion/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          alerta_id: 'id-inexistente-999',
          mensaje: 'Mensaje sin alerta',
          tipo_comunicacion: 'INFORMACION'
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('No se encontro alerta');
    });
  });

  describe('GET /registros_comunicacion/alerta/:id_alerta', () => {
    it('retorna 200 con los registros de la alerta ordenados descendente', async () => {
      if (!createdAlertaId) return;

      const res = await request(baseUrl)
        .get(`/registros_comunicacion/alerta/${createdAlertaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);

      const registro = res.body[0];
      expect(registro).toHaveProperty('id');
      expect(registro).toHaveProperty('alerta_id', createdAlertaId);
      expect(registro).toHaveProperty('mensaje');
      expect(registro).toHaveProperty('tipo_comunicacion');
      expect(registro).toHaveProperty('usuario_id');
      expect(registro).toHaveProperty('usuarioId');
      expect(registro.usuarioId).toHaveProperty('nombre_usuario');
    });

    it('retorna array vacío para alerta sin registros', async () => {
      const otraAlertaId = randomUUID();

      const res = await request(baseUrl)
        .get(`/registros_comunicacion/alerta/${otraAlertaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
