import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 3 ─────────────────────────────────────────────────────────────
// Verifica que un token malformado o expirado sea rechazado con 401.
// La verificación criptográfica del JWT debe fallar ante cualquier token
// que no haya sido emitido por el servidor.

describe('Test 3: Autenticación — Token inválido', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debería retornar 401 al acceder con un token inválido o expirado', async () => {
    // Arrange
    const tokenFalso = 'eyJhbGciOiJIUzI1NiJ9.token-invalido-falso';

    // Act
    const res = await request(baseUrl)
      .get('/alerta/rango')
      .set('Authorization', `Bearer ${tokenFalso}`);

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token invalido o expirado');
  });
});
