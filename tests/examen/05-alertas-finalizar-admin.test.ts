import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

// ─── Test 5 ─────────────────────────────────────────────────────────────
// Verifica que un administrador pueda finalizar una alerta, lo que debe
// actualizar el estado a FINALIZADO y calcular la duración total de la
// emergencia. Esto es crítico para los reportes RUBA.

describe('Test 5: Alertas — Finalizar alerta como admin', () => {
  let adminToken: string;
  let alertaCreadaId: string | null = null;

  beforeAll(async () => {
    // Arrange: iniciar sesión como administrador
    const loginRes = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Limpieza: borrar la alerta creada si existe
    if (alertaCreadaId) {
      await prisma.alerta.deleteMany({ where: { id: alertaCreadaId } });
    }
    await prisma.$disconnect();
  });

  it('debería finalizar una alerta como administrador y calcular la duración total', async () => {
    // Arrange: crear una alerta primero para tener un ID real que finalizar
    const payload = {
      sub_categoria_alerta_id: '1',
      ubicacion: 'Ruta 8 Km 36, Pilar',
      observaciones: 'Incendio forestal en zona de pastizales',
      prioridad: 'ALTA',
      fecha_hora: new Date().toISOString(),
      estado_alerta_id: '1',
    };

    const crearRes = await request(baseUrl)
      .post('/alerta/crear')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);
    expect(crearRes.status).toBe(200);
    const alertaId = crearRes.body.id;
    alertaCreadaId = alertaId;

    // Act
    const res = await request(baseUrl)
      .patch(`/alerta/${alertaId}/finalizar`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', alertaId);
    expect(res.body).toHaveProperty('estado_alerta_id', '3');
    expect(res.body).toHaveProperty('fecha_hora_finalizacion');
    expect(res.body.fecha_hora_finalizacion).not.toBeNull();
    expect(res.body).toHaveProperty('duracion_total_alerta');
    expect(typeof res.body.duracion_total_alerta).toBe('number');
    expect(res.body.duracion_total_alerta).toBeGreaterThan(0);
  });
});
