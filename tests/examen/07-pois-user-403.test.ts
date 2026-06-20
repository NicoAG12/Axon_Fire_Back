import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 7 ─────────────────────────────────────────────────────────────
// Verifica que solo los administradores puedan crear puntos de interés.
// Los POIs (hidrantes, hospitales, materiales peligrosos) son datos
// críticos del mapa operativo y no deben ser modificados por usuarios
// regulares.

describe('Test 7: POIs — USER no puede crear (403)', () => {
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

  it('debería retornar 403 si un usuario USER intenta crear un POI', async () => {
    // Arrange
    const payload = {
      nombre: 'Hidrante de prueba — debe ser rechazado',
      categoria: 'HIDRANTE',
      latitud: -34.6037,
      longitud: -58.3816,
    };

    // Act
    const res = await request(baseUrl)
      .post('/api/maps/pois')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload);

    // Assert
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('No tiene permisos de administrador');
  });
});
