import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 4 ─────────────────────────────────────────────────────────────
// Verifica que cualquier usuario autenticado pueda crear una alerta de
// emergencia. Es la funcionalidad principal del sistema — los bomberos
// necesitan reportar incidentes rápidamente.

describe('Test 4: Alertas — Crear alerta', () => {
  let token: string;
  let alertaCreadaId: string | null = null;

  beforeAll(async () => {
    // Arrange: iniciar sesión como usuario regular
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Limpieza: borrar la alerta creada si existe
    if (alertaCreadaId) {
      await prisma.alerta.deleteMany({ where: { id: alertaCreadaId } });
    }
    await prisma.$disconnect();
  });

  it('debería crear una alerta y retornar los datos de la emergencia', async () => {
    // Arrange
    const payload = {
      sub_categoria_alerta_id: '1',
      ubicacion: 'Av. Siempre Viva 742, Springfield',
      observaciones: 'Incendio estructural en edificio de 3 pisos',
      prioridad: 'ALTA',
      fecha_hora: new Date().toISOString(),
      estado_alerta_id: '1',
      latitud: -34.6037,
      longitud: -58.3816,
    };

    // Act
    const res = await request(baseUrl)
      .post('/alerta/crear')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
    expect(res.body).toHaveProperty('ubicacion', payload.ubicacion);
    expect(res.body).toHaveProperty('observaciones', payload.observaciones);
    expect(res.body).toHaveProperty('prioridad', payload.prioridad);
    expect(res.body).toHaveProperty('sub_categoria_alerta_id', payload.sub_categoria_alerta_id);
    expect(res.body).toHaveProperty('estado_alerta_id', payload.estado_alerta_id);
    expect(res.body).toHaveProperty('fecha_hora');

    alertaCreadaId = res.body.id;
  });
});
