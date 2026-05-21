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
    // 1. Obtener un token JWT legítimo para las llamadas del endpoint
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
    // Limpieza de datos creados durante el test de historial
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

      // Obtener las claves (sectores/compartimentos) devueltos
      const sectoresDevueltos = Object.keys(res.body);
      expect(sectoresDevueltos.length).toBeGreaterThan(0);

      // Comprobar que contiene sectores válidos del camión 1 (según el seed)
      expect(sectoresDevueltos).toContain('Compartimento Lateral Izquierdo 1');
      expect(sectoresDevueltos).toContain('Compartimento Lateral Izquierdo 2');

      // Comprobar que no contiene sectores que pertenecen exclusivamente a otros camiones (ej. camión 3)
      expect(sectoresDevueltos).not.toContain('Compartimento Principal');

      // Comprobar que los items dentro del sector tienen la estructura jerárquica esperada:
      // { inventarioId, herramienta, cantidad }
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
      // 1. Simular la creación de un checklist fechado exactamente AYER (hace 24 horas)
      createdChecklistId = randomUUID();
      const fechaAyer = new Date();
      fechaAyer.setDate(fechaAyer.getDate() - 1); // Restar 1 día

      // Insertar directo en la DB usando Prisma Client para forzar la fecha del pasado
      await prisma.checklist_camiones_diario.create({
        data: {
          id: createdChecklistId,
          camion_id: testCamionId,
          usuario_id: userId,
          fecha_control: fechaAyer // Forzamos fecha de ayer
        }
      });

      // Insertar un detalle de herramienta para ese checklist
      await prisma.checklist_detalle.create({
        data: {
          id: randomUUID(),
          checklist_id: createdChecklistId,
          inventario_id: 'inv_1', // Extintor 2.5kg en sector 1 de camion 1
          controlado: 'CHEQUEADO',
          observaciones: 'Controlado el día de ayer'
        }
      });

      // 2. Ejecutar la función del Service (Unit Test / Repository validation)
      const historial = await checklistService.obtenerHistorialPorCamion(testCamionId);

      // 3. Validar que el historial no esté vacío y contenga nuestro checklist de ayer
      expect(historial).toBeDefined();
      expect(Array.isArray(historial)).toBe(true);
      expect(historial.length).toBeGreaterThan(0);

      const checklistRecuperado = historial.find(c => c.id === createdChecklistId);
      expect(checklistRecuperado).toBeDefined();

      // Comprobar la exactitud de los datos recuperados
      expect(checklistRecuperado?.camion_id).toBe(testCamionId);
      expect(checklistRecuperado?.usuario_id).toBe(userId);
      expect(new Date(checklistRecuperado!.fecha_control).toDateString()).toBe(fechaAyer.toDateString());

      // Verificar que incluye los detalles y la relación con el usuario (bombero) de forma correcta
      expect(checklistRecuperado?.detalles).toBeDefined();
      expect(checklistRecuperado?.detalles.length).toBe(1);
      expect(checklistRecuperado?.detalles[0].observaciones).toBe('Controlado el día de ayer');
      expect(checklistRecuperado?.usuarioId.nombre_usuario).toBe('TEST_2_USER');
    });
  });
});
