import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 10 ────────────────────────────────────────────────────────────
// Verifica que se pueda obtener el historial de checklists de un camión.
// El historial permite a los bomberos consultar controles anteriores y
// verificar el estado del equipamiento a lo largo del tiempo.

describe('Test 10: Checklist — Historial por camión', () => {
  let token: string;
  let checklistCreadoId: string | null = null;

  beforeAll(async () => {
    // Arrange: iniciar sesión como usuario regular
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Limpieza: borrar el checklist creado (los detalles se borran por cascade)
    if (checklistCreadoId) {
      await prisma.checklist_camiones_diario.deleteMany({
        where: { id: checklistCreadoId },
      });
    }
    await prisma.$disconnect();
  });

  it('debería retornar el historial de checklists de un camión como un array', async () => {
    // Arrange: crear un checklist via API para tener datos en el historial
    const payload = {
      camionId: 'camion_2',
      detalles: [
        { inventarioId: 'inv_6', controlado: 'CHEQUEADO' },
        {
          inventarioId: 'inv_7',
          controlado: 'FALTANTE',
          observaciones: 'Manguera faltante en inventario',
        },
      ],
    };

    const crearRes = await request(baseUrl)
      .post('/checklist/guardar')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(crearRes.status).toBe(201);
    const checklistId = crearRes.body.id;
    checklistCreadoId = checklistId;

    // Act
    const res = await request(baseUrl)
      .get('/checklist/historial/camion_2')
      .set('Authorization', `Bearer ${token}`);

    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const encontrado = res.body.find((c: any) => c.id === checklistId);
    expect(encontrado).toBeDefined();
    expect(encontrado).toHaveProperty('camion_id', 'camion_2');
  });
});
