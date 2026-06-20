import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 8 ─────────────────────────────────────────────────────────────
// Verifica que un administrador pueda crear un punto de interés (POI)
// correctamente, asignándole un ID único y devolviendo los datos
// enviados. Los POI son fundamentales para la navegación operativa.

describe('Test 8: POIs — Admin crea POI exitosamente', () => {
  let adminToken: string;
  let poiCreadoId: string | null = null;

  beforeAll(async () => {
    // Arrange: iniciar sesión como administrador
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Limpieza: borrar el POI creado si existe
    if (poiCreadoId) {
      await prisma.puntos_interes.deleteMany({ where: { id: poiCreadoId } });
    }
    await prisma.$disconnect();
  });

  it('debería crear un POI como administrador y retornarlo con estado 201', async () => {
    // Arrange
    const payload = {
      nombre: 'Hidrante Av. Libertador',
      categoria: 'HIDRANTE',
      descripcion: 'Hidrante ubicado en Av. Libertador y Callao',
      latitud: -34.6037,
      longitud: -58.3816,
    };

    // Act
    const res = await request(baseUrl)
      .post('/api/maps/pois')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
    expect(res.body).toHaveProperty('nombre', payload.nombre);
    expect(res.body).toHaveProperty('categoria', payload.categoria);
    expect(res.body).toHaveProperty('descripcion', payload.descripcion);
    expect(res.body).toHaveProperty('latitud', payload.latitud);
    expect(res.body).toHaveProperty('longitud', payload.longitud);
    expect(res.body).toHaveProperty('creado_por');

    poiCreadoId = res.body.id;
  });
});
