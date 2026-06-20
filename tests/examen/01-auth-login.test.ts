import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 1 ─────────────────────────────────────────────────────────────
// Verifica que el login con credenciales válidas devuelva un token JWT.
// Es la puerta de entrada al sistema — si falla, ninguna funcionalidad
// protegida puede usarse.

describe('Test 1: Autenticación — Login exitoso', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería retornar 200 y un token al iniciar sesión con credenciales válidas', async () => {
    // Arrange
    const credenciales = {
      nombre_usuario: 'TEST_1_ADMIN',
      password: 'TEST_1_PASSWORD',
    };

    // Act
    const res = await request(baseUrl)
      .post('/auth/login')
      .send(credenciales);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token).not.toBe('');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('rol', 'ADMIN');
  });
});
