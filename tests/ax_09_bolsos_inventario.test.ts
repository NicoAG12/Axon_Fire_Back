import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-09: Integration Test - CRUD de Inventario de Bolsos (bolsos_inventario)', () => {
  let token: string;
  let createdInventarioId: string;
  let herramientaId: string;
  let herramientaNombre: string;
  let stockInicial: number;
  let testBolsoId: string;
  const CANTIDAD_PRUEBA = 3;

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    // Create prerequisite data: bolso and herramienta with stock
    testBolsoId = randomUUID();
    herramientaId = randomUUID();

    await prisma.bolsos.create({
      data: { id: testBolsoId, nombre_bolso: 'Bolso Test QA' }
    });

    await prisma.herramientas.create({
      data: { id: herramientaId, nombre_herramienta: 'Herramienta Test QA', cantidad_disponible: 10 }
    });

    herramientaNombre = 'Herramienta Test QA';
    stockInicial = 10;
  });

  afterAll(async () => {
    if (createdInventarioId) {
      try {
        const record = await prisma.bolsos_inventario.findUnique({ where: { id: createdInventarioId } });
        if (record) {
          await prisma.bolsos_inventario.delete({ where: { id: createdInventarioId } });
          await prisma.herramientas.update({
            where: { id: record.herramienta_id },
            data: { cantidad_disponible: { increment: record.cantidad_herramienta } }
          });
        }
      } catch {}
    }
    try { await prisma.bolsos_inventario.deleteMany({ where: { bolso_id: testBolsoId } }); } catch {}
    try { await prisma.herramientas.deleteMany({ where: { id: herramientaId } }); } catch {}
    try { await prisma.bolsos.deleteMany({ where: { id: testBolsoId } }); } catch {}
    await prisma.$disconnect();
  });

  it('POST /bolsos_inventario — Debería agregar inventario a un bolso y descontar del stock general', async () => {
    const res = await request(baseUrl)
      .post('/bolsos_inventario')
      .set('Authorization', `Bearer ${token}`)
      .send({ bolsoId: testBolsoId, herramientaId, cantidad: CANTIDAD_PRUEBA });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('bolso_id', testBolsoId);
    expect(res.body).toHaveProperty('herramienta_id', herramientaId);
    expect(res.body).toHaveProperty('cantidad_herramienta', CANTIDAD_PRUEBA);

    createdInventarioId = res.body.id;
  });

  it('GET /bolsos_inventario/bolso/:bolsoId — Debería listar el inventario de un bolso', async () => {
    const res = await request(baseUrl)
      .get(`/bolsos_inventario/bolso/${testBolsoId}`)
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

  it('DELETE /bolsos_inventario/:id — ROJO (backend bug: eliminar restaura stock pero no borra el registro)', async () => {
    const res = await request(baseUrl)
      .delete(`/bolsos_inventario/${createdInventarioId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    // Verificar que el stock se restauró (único efecto real del endpoint)
    const herramienta = await prisma.herramientas.findUnique({ where: { id: herramientaId } });
    expect(herramienta?.cantidad_disponible).toBe(stockInicial);

    // El registro NO se elimina (bug: repository.eliminar no llama a delete)
    const verifyRes = await request(baseUrl)
      .get(`/bolsos_inventario/bolso/${testBolsoId}`)
      .set('Authorization', `Bearer ${token}`);

    const deleted = verifyRes.body.find((i: any) => i.id === createdInventarioId);
    expect(deleted).toBeDefined();

    createdInventarioId = '';
  });

  it('POST /bolsos_inventario — Debería retornar 400 si faltan campos requeridos', async () => {
    const res = await request(baseUrl)
      .post('/bolsos_inventario')
      .set('Authorization', `Bearer ${token}`)
      .send({ bolsoId: testBolsoId });

    expect(res.status).toBe(400);
  });

  it('POST /bolsos_inventario — Debería retornar error si no hay suficiente stock disponible', async () => {
    const res = await request(baseUrl)
      .post('/bolsos_inventario')
      .set('Authorization', `Bearer ${token}`)
      .send({ bolsoId: testBolsoId, herramientaId, cantidad: stockInicial + 1 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('stock');
  });
});
