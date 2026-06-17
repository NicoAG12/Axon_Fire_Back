import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { ChecklistService } from '../src/modules/checklist/checklist.service';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-08: Estructura Jerárquica del Camión e Historial del Día Anterior', () => {
  let token: string;
  const checklistService = new ChecklistService();
  const testCamionId = 'camion_1'; // Camión de Rescate 1 (del seed)
  const otherCamionId = 'camion_3'; // Camión de apoyo (del seed)
  const userId = 'abc2'; // TEST_2_USER
  let createdChecklistId: string;

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

      // No debe incluir sectores exclusivos de otros camiones (ej. camión 3)
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

      // Insertar directo en DB con Prisma para forzar fecha en el pasado
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
          inventario_id: 'inv_1', // Extintor 2.5kg en sector 1 de camion 1
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
