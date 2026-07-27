import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { ChecklistService } from '../src/modules/checklist/checklist.service';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-08: Estructura Jerárquica del Camión e Historial del Día Anterior', () => {
  let token: string;
  const checklistService = new ChecklistService();
  let testCamionId: string;
  let createdInventarioId: string;
  let createdChecklistId: string;
  let createdHerramientaId: string;
  const userId = 'abc2'; // TEST_2_USER

  beforeAll(async () => {
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({
        nombre_usuario: 'TEST_2_USER',
        password: 'TEST_1_PASSWORD'
      });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
    expect(token).toBeDefined();

    testCamionId = randomUUID();
    createdHerramientaId = randomUUID();
    createdInventarioId = randomUUID();
    const sector1Id = randomUUID();
    const sector2Id = randomUUID();
    const herr2Id = randomUUID();
    const inv2Id = randomUUID();

    await prisma.camiones.create({
      data: { id: testCamionId, nombre_camion: 'Test Camion QA', estado: 'ACTIVO' }
    });

    await prisma.herramientas.createMany({
      data: [
        { id: createdHerramientaId, nombre_herramienta: 'Extintor 2.5kg', cantidad_disponible: 10 },
        { id: herr2Id, nombre_herramienta: 'Manguera 70mm', cantidad_disponible: 20 },
      ]
    });

    await prisma.sectores_camion.createMany({
      data: [
        { id: sector1Id, camion_id: testCamionId, nombre_sector: 'Compartimento Lateral Izquierdo 1' },
        { id: sector2Id, camion_id: testCamionId, nombre_sector: 'Compartimento Lateral Izquierdo 2' },
      ]
    });

    await prisma.camiones_inventario.createMany({
      data: [
        { id: createdInventarioId, camion_id: testCamionId, sector_id: sector1Id, herramienta_id: createdHerramientaId, cantidad_herramienta: 2 },
        { id: inv2Id, camion_id: testCamionId, sector_id: sector2Id, herramienta_id: herr2Id, cantidad_herramienta: 4 },
      ]
    });
  });

  afterAll(async () => {
    if (createdChecklistId) {
      await prisma.checklist_detalle.deleteMany({
        where: { checklist_id: createdChecklistId }
      });
      await prisma.checklist_camiones_diario.deleteMany({
        where: { id: createdChecklistId }
      });
    }
    await prisma.camiones_inventario.deleteMany({ where: { camion_id: testCamionId } });
    await prisma.sectores_camion.deleteMany({ where: { camion_id: testCamionId } });
    try { await prisma.herramientas.deleteMany({ where: { id: createdHerramientaId } }); } catch {}
    await prisma.camiones.deleteMany({ where: { id: testCamionId } });
    await prisma.$disconnect();
  });

  describe('Integration Test: Estructura jerárquica del camión (Compartimentos agrupados)', () => {
    it('Debería retornar la estructura jerárquica correcta agrupada por sector para el camión seleccionado', async () => {
      const res = await request(baseUrl)
        .get(`/camiones_inventario/camion/${testCamionId}/agrupado`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(typeof res.body).toBe('object');

      const sectoresDevueltos = Object.keys(res.body);
      expect(sectoresDevueltos.length).toBeGreaterThan(0);

      expect(sectoresDevueltos).toContain('Compartimento Lateral Izquierdo 1');
      expect(sectoresDevueltos).toContain('Compartimento Lateral Izquierdo 2');

      expect(sectoresDevueltos).not.toContain('Compartimento Principal');

      const itemsEnSector = res.body['Compartimento Lateral Izquierdo 1'];
      expect(Array.isArray(itemsEnSector)).toBe(true);
      expect(itemsEnSector.length).toBeGreaterThan(0);

      const primerItem = itemsEnSector[0];
      expect(primerItem).toHaveProperty('inventarioId');
      expect(primerItem).toHaveProperty('herramienta');
      expect(primerItem).toHaveProperty('cantidad');
      expect(primerItem.herramienta).toBe('Extintor 2.5kg');
    });
  });

  describe('Unit Test: Historial del día anterior se recupera correctamente', () => {
    it('Debería poder recuperar del historial un checklist creado el día anterior', async () => {
      createdChecklistId = randomUUID();
      const fechaAyer = new Date();
      fechaAyer.setDate(fechaAyer.getDate() - 1);

      await prisma.checklist_camiones_diario.create({
        data: {
          id: createdChecklistId,
          camion_id: testCamionId,
          usuario_id: userId,
          fecha_control: fechaAyer
        }
      });

      await prisma.checklist_detalle.create({
        data: {
          id: randomUUID(),
          checklist_id: createdChecklistId,
          inventario_id: createdInventarioId,
          controlado: 'CHEQUEADO',
          observaciones: 'Controlado el día de ayer'
        }
      });

      const historial = await checklistService.obtenerHistorialPorCamion(testCamionId);

      expect(historial).toBeDefined();
      expect(Array.isArray(historial)).toBe(true);
      expect(historial.length).toBeGreaterThan(0);

      const checklistRecuperado = historial.find(c => c.id === createdChecklistId);
      expect(checklistRecuperado).toBeDefined();

      expect(checklistRecuperado?.camion_id).toBe(testCamionId);
      expect(checklistRecuperado?.usuario_id).toBe(userId);
      expect(new Date(checklistRecuperado!.fecha_control).toDateString()).toBe(fechaAyer.toDateString());

      expect(checklistRecuperado?.detalles).toBeDefined();
      expect(checklistRecuperado?.detalles.length).toBe(1);
      expect(checklistRecuperado?.detalles[0].observaciones).toBe('Controlado el día de ayer');
      expect(checklistRecuperado?.usuarioId.nombre_usuario).toBe('TEST_2_USER');
    });
  });
});
