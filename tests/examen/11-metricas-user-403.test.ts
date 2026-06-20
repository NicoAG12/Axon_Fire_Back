import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 11 ────────────────────────────────────────────────────────────
// Verifica que las métricas mensuales (reportes RUBA) solo sean
// accesibles para administradores. Contienen datos sensibles de horas
// trabajadas y asistencias del cuerpo de bomberos.

describe('Test 11: Estadísticas — USER no puede ver métricas (403)', () => {
  let userToken: string;

  beforeAll(async () => {
    // Arrange: iniciar sesión como usuario regular
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    userToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería retornar 403 si un usuario USER consulta métricas mensuales', async () => {
    // Arrange
    const mes = 6;
    const anio = 2026;

    // Act
    const res = await request(baseUrl)
      .get(`/metricas/mensuales?mes=${mes}&anio=${anio}`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('No tiene permisos de administrador');
  });
});
