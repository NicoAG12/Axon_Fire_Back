import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 9 ─────────────────────────────────────────────────────────────
// Verifica que se pueda guardar un checklist de camión con sus detalles
// de herramientas controladas. Este registro diario es obligatorio para
// asegurar que el equipamiento esté en condiciones operativas.

describe('Test 9: Checklist — Guardar checklist de camión', () => {
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

  it('debería guardar un checklist de camión con sus detalles y retornar 201', async () => {
    // Arrange
    const payload = {
      camionId: 'camion_1',
      detalles: [
        { inventarioId: 'inv_1', controlado: 'CHEQUEADO' },
        { inventarioId: 'inv_2', controlado: 'CHEQUEADO' },
      ],
    };

    // Act
    const res = await request(baseUrl)
      .post('/checklist/guardar')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
    expect(res.body).toHaveProperty('camion_id', payload.camionId);
    expect(res.body).toHaveProperty('usuario_id');
    expect(res.body).toHaveProperty('fecha_control');

    checklistCreadoId = res.body.id;
  });
});
