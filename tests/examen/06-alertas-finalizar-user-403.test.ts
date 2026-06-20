import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 6 ─────────────────────────────────────────────────────────────
// Verifica que el middleware verificarRolAdmin impida que usuarios con
// rol USER finalicen alertas. Solo los administradores pueden cerrar
// emergencias — esto evita cierres accidentales o malintencionados.

describe('Test 6: Alertas — USER no puede finalizar (403)', () => {
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

  it('debería retornar 403 si un usuario USER intenta finalizar una alerta', async () => {
    // Arrange: se usa la alerta semilla con ID '1' (estado PENDIENTE).
    // El middleware verifica el rol antes de llegar al controlador, por lo
    // que el ID puede ser cualquiera — ni siquiera necesita existir.
    const alertaId = '1';

    // Act
    const res = await request(baseUrl)
      .patch(`/alerta/${alertaId}/finalizar`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('No tiene permisos de administrador');
  });
});
