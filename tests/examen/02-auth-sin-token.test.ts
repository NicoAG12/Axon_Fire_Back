import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 2 ─────────────────────────────────────────────────────────────
// Verifica que el middleware de autenticación rechace requests sin token.
// Sin esta protección, cualquier persona externa podría acceder a
// información sensible del sistema.

describe('Test 2: Autenticación — Endpoint protegido sin token', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería retornar 401 al acceder a un endpoint protegido sin token', async () => {
    // Arrange: no se envía header Authorization

    // Act
    const res = await request(baseUrl)
      .get('/alerta/rango');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'No existe autorizacion');
  });
});
