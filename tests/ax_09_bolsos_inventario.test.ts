import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-09: Integration Test - CRUD de Inventario de Bolsos (bolsos_inventario)', () => {
  let token: string;
  let createdInventarioId: string;
  let herramientaId: string;
  let herramientaNombre: string;
  let stockInicial: number;
  const CANTIDAD_PRUEBA = 3;

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    // Buscar herramienta con suficiente stock para la prueba
    const herramientas = await prisma.herramientas.findMany({
      where: { cantidad_disponible: { gte: CANTIDAD_PRUEBA } },
      orderBy: { cantidad_disponible: 'desc' },
      take: 1
    });
    expect(herramientas.length).toBeGreaterThan(0);
    herramientaId = herramientas[0].id;
    herramientaNombre = herramientas[0].nombre_herramienta;
    stockInicial = herramientas[0].cantidad_disponible;
  });

  afterAll(async () => {
    if (createdInventarioId) {
      const record = await prisma.bolsos_inventario.findUnique({ where: { id: createdInventarioId } });
      if (record) {
        await prisma.bolsos_inventario.delete({ where: { id: createdInventarioId } });
        await prisma.herramientas.update({
          where: { id: record.herramienta_id },
          data: { cantidad_disponible: { increment: record.cantidad_herramienta } }
        });
      }
    }
    await prisma.$disconnect();
  });

  it('POST /bolsos_inventario — Debería agregar inventario a un bolso y descontar del stock general', async () => {
    const res = await request(baseUrl)
      .post('/bolsos_inventario')
      .set('Authorization', `Bearer ${token}`)
      .send({ bolsoId: 'bolso_1', herramientaId, cantidad: CANTIDAD_PRUEBA });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('bolso_id', 'bolso_1');
    expect(res.body).toHaveProperty('herramienta_id', herramientaId);
    expect(res.body).toHaveProperty('cantidad_herramienta', CANTIDAD_PRUEBA);

    createdInventarioId = res.body.id;
  });

  it('GET /bolsos_inventario/bolso/:bolsoId — Debería listar el inventario de un bolso', async () => {
    const res = await request(baseUrl)
      .get('/bolsos_inventario/bolso/bolso_1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const item = res.body.find((i: any) => i.id === createdInventarioId);
    expect(item).toBeDefined();
    expect(item.herramientaId).toHaveProperty('nombre_herramienta', herramientaNombre);
  });

  it('PATCH /bolsos_inventario/:id — Debería actualizar la cantidad de un item de inventario', async () => {
    const res = await request(baseUrl)
      .patch(`/bolsos_inventario/${createdInventarioId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cantidad: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cantidad_herramienta', 5);
  });

  it('DELETE /bolsos_inventario/:id — Debería eliminar un item de inventario', async () => {
    const res = await request(baseUrl)
      .delete(`/bolsos_inventario/${createdInventarioId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    const verifyRes = await request(baseUrl)
      .get(`/bolsos_inventario/bolso/bolso_1`)
      .set('Authorization', `Bearer ${token}`);

    const deleted = verifyRes.body.find((i: any) => i.id === createdInventarioId);
    expect(deleted).toBeUndefined();

    createdInventarioId = '';
  });

  it('POST /bolsos_inventario — Debería retornar 400 si faltan campos requeridos', async () => {
    const res = await request(baseUrl)
      .post('/bolsos_inventario')
      .set('Authorization', `Bearer ${token}`)
      .send({ bolsoId: 'bolso_1' });

    expect(res.status).toBe(400);
  });

  it('POST /bolsos_inventario — Debería retornar error si no hay suficiente stock disponible', async () => {
    const res = await request(baseUrl)
      .post('/bolsos_inventario')
      .set('Authorization', `Bearer ${token}`)
      .send({ bolsoId: 'bolso_1', herramientaId, cantidad: stockInicial + 1 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('stock');
  });
});
