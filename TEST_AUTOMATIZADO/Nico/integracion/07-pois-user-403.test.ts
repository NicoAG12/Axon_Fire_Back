import 'dotenv/config';
import request from 'supertest';
import { expect } from 'chai';
import { prisma } from '../../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 7 ─────────────────────────────────────────────────────────────
// Verifica que solo los administradores puedan crear puntos de interés.
// Los POIs (hidrantes, hospitales, materiales peligrosos) son datos
// críticos del mapa operativo y no deben ser modificados por usuarios
// regulares.

describe('Test 7: POIs — USER no puede crear (403)', () => {
  let userToken: string;

  before(async () => {
    // Arrange: iniciar sesión como usuario regular
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).to.equal(200);
    userToken = loginRes.body.token;
  });

  after(async () => {
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
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('message');
    expect(res.body.message).to.include('No tiene permisos de administrador');
  });
});

