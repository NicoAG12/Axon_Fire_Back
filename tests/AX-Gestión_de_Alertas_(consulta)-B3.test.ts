import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-Gestión_de_Alertas_(consulta)-B3 — Consulta de Alertas', () => {
  let adminToken: string;
  let userToken: string;
  let createdAlertaId: string;
  let createdAlertaUbicacion: string;
  let createdAlertaFecha: string;

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

    // Asegurar datos de referencia para alertas
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
        ubicacion: 'Av. Test B3 456',
        latitud: -34.6037,
        longitud: -58.3816,
        observaciones: 'Alerta de prueba para test de consulta B3',
        fecha_hora: new Date().toISOString(),
        estado_alerta_id: '1',
        prioridad: 'MEDIA'
      });

    if (crearRes.status === 200) {
      createdAlertaId = crearRes.body.id;
      createdAlertaUbicacion = crearRes.body.ubicacion;
      createdAlertaFecha = crearRes.body.fecha_hora;
    } else {
      console.warn('No se pudo crear alerta de prueba B3:', crearRes.body);
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
    it('GET /alerta/rango sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/alerta/rango');
      expect(res.status).toBe(401);
    });

    it('GET /alerta/:id_alerta sin token retorna 401', async () => {
      const res = await request(baseUrl).get(`/alerta/${createdAlertaId || 'no-op'}`);
      expect(res.status).toBe(401);
    });

    it('GET /alerta/usuario/:id_usuario sin token retorna 401', async () => {
      const res = await request(baseUrl).get('/alerta/usuario/abc1');
      expect(res.status).toBe(401);
    });

    it('GET /alerta/rango con token USER retorna 200', async () => {
      const desde = new Date(Date.now() - 86400000).toISOString();
      const hasta = new Date().toISOString();
      const res = await request(baseUrl)
        .get(`/alerta/rango?fecha_desde=${desde}&fecha_hasta=${hasta}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /alerta/rango', () => {
    it('retorna alertas dentro del rango de fechas', async () => {
      if (!createdAlertaId) return;

      // Use the stored ART wall-clock time ±5min for reliable matching
      const storedDate = new Date(createdAlertaFecha);
      const desde = new Date(storedDate.getTime() - 300000).toISOString();
      const hasta = new Date(storedDate.getTime() + 300000).toISOString();

      const res = await request(baseUrl)
        .get(`/alerta/rango?fecha_desde=${desde}&fecha_hasta=${hasta}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('alertas');
      expect(Array.isArray(res.body.alertas)).toBe(true);

      const encontrada = res.body.alertas.find((a: any) => a.id === createdAlertaId);
      expect(encontrada).toBeDefined();
      expect(encontrada.ubicacion).toBe(createdAlertaUbicacion);
    });

    it('retorna array vacío si no hay alertas en el rango', async () => {
      const pasado = new Date('2020-01-01').toISOString();
      const pasadoFin = new Date('2020-01-02').toISOString();

      const res = await request(baseUrl)
        .get(`/alerta/rango?fecha_desde=${pasado}&fecha_hasta=${pasadoFin}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('alertas');
      expect(res.body.alertas.length).toBe(0);
    });
  });

  describe('GET /alerta/:id_alerta', () => {
    it('retorna 200 con la alerta por ID', async () => {
      if (!createdAlertaId) return;

      const res = await request(baseUrl)
        .get(`/alerta/${createdAlertaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', createdAlertaId);
      expect(res.body).toHaveProperty('ubicacion', createdAlertaUbicacion);
      expect(res.body).toHaveProperty('estadoAlerta');
      expect(res.body.estadoAlerta).toHaveProperty('nombre_estado');
    });

    it('retorna 404 si la alerta no existe', async () => {
      const res = await request(baseUrl)
        .get('/alerta/id-inexistente-999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Alerta no encontrada');
    });
  });

  describe('GET /alerta/usuario/:id_usuario', () => {
    it('retorna alertas creadas por el administrador', async () => {
      if (!createdAlertaId) return;

      const res = await request(baseUrl)
        .get('/alerta/usuario/abc1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const encontrada = res.body.find((a: any) => a.id === createdAlertaId);
      expect(encontrada).toBeDefined();
      expect(encontrada.usuario_alta_alerta).toBe('abc1');
    });

    it('retorna array vacío si el usuario no tiene alertas', async () => {
      const res = await request(baseUrl)
        .get('/alerta/usuario/id-sin-alertas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
