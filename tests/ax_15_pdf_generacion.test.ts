import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-15: Test de Generación de PDF de Informe de Emergencia', () => {
  let token: string;
  let createdAlertaId: string;
  let subcategoriaId: string;
  let categoriaId: string;

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    // Create FK lookup data: estados_alerta, categorias_alerta, subcategoria_alerta
    // Use get-or-create with race-condition handling for parallel suites
    const getOrCreateEstado = async (nombre: string) => {
      const existing = await prisma.estados_alerta.findFirst({ where: { nombre_estado: nombre } });
      if (existing) return existing.id;
      try {
        const created = await prisma.estados_alerta.create({ data: { id: randomUUID(), nombre_estado: nombre } });
        return created.id;
      } catch (e: any) {
        if (e.code === 'P2002') {
          const found = await prisma.estados_alerta.findFirst({ where: { nombre_estado: nombre } });
          if (found) return found.id;
        }
        throw e;
      }
    };

    const getOrCreateCategoria = async (nombre: string) => {
      const existing = await prisma.categorias_alerta.findFirst({ where: { nombre_categoria: nombre } });
      if (existing) return existing.id;
      try {
        const created = await prisma.categorias_alerta.create({ data: { id: randomUUID(), nombre_categoria: nombre } });
        return created.id;
      } catch (e: any) {
        if (e.code === 'P2002') {
          const found = await prisma.categorias_alerta.findFirst({ where: { nombre_categoria: nombre } });
          if (found) return found.id;
        }
        throw e;
      }
    };

    const estadoFinalizadoId = await getOrCreateEstado('FINALIZADO');
    const estadoPendienteId = await getOrCreateEstado('PENDIENTE');
    categoriaId = await getOrCreateCategoria('INCENDIO');

    const existingSub = await prisma.subcategoria_alerta.findFirst({
      where: { nombre_sub_categoria: 'INCENDIO ESTRUCTURAL' }
    });
    subcategoriaId = existingSub ? existingSub.id : (await prisma.subcategoria_alerta.create({
      data: { id: randomUUID(), categoria_alerta_id: categoriaId, nombre_sub_categoria: 'INCENDIO ESTRUCTURAL' }
    })).id;

    // Create alerta FINALIZADA con datos completos
    createdAlertaId = randomUUID();
    const ahora = new Date();
    const hace3h = new Date(ahora.getTime() - 3 * 3600 * 1000);

    await prisma.alerta.create({
      data: {
        id: createdAlertaId,
        sub_categoria_alerta_id: subcategoriaId,
        ubicacion: 'Av. Siempreviva 742, Springfield',
        observaciones: 'Incendio estructural en vivienda familiar. Se controló el foco ígneo sin víctimas.',
        fecha_hora: hace3h,
        fecha_hora_finalizacion: ahora,
        duracion_total_alerta: 10800000,
        estado_alerta_id: estadoFinalizadoId,
        usuario_alta_alerta: 'abc1'
      }
    });

    // The new generarPDF requires an informes_emergencia record (not just an alerta)
    await prisma.informes_emergencia.create({
      data: {
        alerta_id: createdAlertaId,
        creado_por: 'abc1',
        observaciones_admin: 'Informe generado automáticamente para test AX-15'
      }
    });
  });

  afterAll(async () => {
    if (createdAlertaId) {
      await prisma.informes_emergencia.deleteMany({ where: { alerta_id: createdAlertaId } });
      await prisma.alerta.deleteMany({ where: { id: createdAlertaId } });
    }
    await prisma.$disconnect();
  });

  it('GET /informes/:alertaId/pdf — Debería generar un PDF válido con los datos de la emergencia', async () => {
    const res = await request(baseUrl)
      .get(`/informes/${createdAlertaId}/pdf`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment; filename="informe_emergencia_');

    expect(Buffer.isBuffer(res.body) || typeof res.body === 'object').toBe(true);
    const pdfBuffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body);
    expect(pdfBuffer.slice(0, 5).toString()).toBe('%PDF-');
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  });

  it('GET /informes/:alertaId/pdf — Sin informe_emergencia retorna 500 Informe no encontrado', async () => {
    const alertaSinInformeId = randomUUID();
    const ahora = new Date();
    const hace1h = new Date(ahora.getTime() - 1 * 3600 * 1000);

    // Reuse existing FK IDs from beforeAll scope
    // Need to get estadoPendienteId — fetch it
    const estadoPendiente = await prisma.estados_alerta.findFirst({ where: { nombre_estado: 'PENDIENTE' } });

    await prisma.alerta.create({
      data: {
        id: alertaSinInformeId,
        sub_categoria_alerta_id: subcategoriaId,
        ubicacion: 'Test sin informe',
        observaciones: 'Alerta sin informe_emergencia asociado',
        fecha_hora: hace1h,
        estado_alerta_id: estadoPendiente!.id,
        usuario_alta_alerta: 'abc1'
      }
    });

    const res = await request(baseUrl)
      .get(`/informes/${alertaSinInformeId}/pdf`)
      .set('Authorization', `Bearer ${token}`);

    // New generarPDF doesn't validate estado — it requires informe_emergencia record
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Informe no encontrado');

    await prisma.alerta.deleteMany({ where: { id: alertaSinInformeId } });
  });
});
