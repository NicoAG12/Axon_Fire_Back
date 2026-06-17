import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-16: Validación de Permisos - Acceso a Borrador de Informes', () => {
  let adminToken: string;
  let userToken: string;
  let createdAlertaId: string;

  beforeAll(async () => {
    const loginAdmin = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_1_ADMIN', password: 'TEST_1_PASSWORD' });
    expect(loginAdmin.status).toBe(200);
    adminToken = loginAdmin.body.token;

    const loginUser = await request(baseUrl)
      .post('/auth/login')
      .send({ nombre_usuario: 'TEST_2_USER', password: 'TEST_1_PASSWORD' });
    expect(loginUser.status).toBe(200);
    userToken = loginUser.body.token;

    // Crear alerta FINALIZADA para probar los endpoints de borrador
    createdAlertaId = randomUUID();
    const ahora = new Date();
    const hace2h = new Date(ahora.getTime() - 2 * 3600 * 1000);

    await prisma.alerta.create({
      data: {
        id: createdAlertaId,
        sub_categoria_alerta_id: '1',
        ubicacion: 'AX-16 Test Ubicación',
        observaciones: 'Alerta para test de permisos AX-16',
        fecha_hora: hace2h,
        fecha_hora_finalizacion: ahora,
        duracion_total_alerta: 7200000,
        estado_alerta_id: '3',
        usuario_alta_alerta: 'abc1'
      }
    });
  });

  afterAll(async () => {
    if (createdAlertaId) {
      await prisma.informes_emergencia.deleteMany({ where: { alerta_id: createdAlertaId } });
      await prisma.alerta.deleteMany({ where: { id: createdAlertaId } });
    }
    await prisma.$disconnect();
  });

  describe('Usuario con rol USER (aspirante) - Debería recibir 403', () => {
    it('ROJO - GET /informes/:alertaId/borrador con rol USER debe retornar 403', async () => {
      const res = await request(baseUrl)
        .get(`/informes/${createdAlertaId}/borrador`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('No tiene permisos de administrador');
    });

    it('ROJO - PATCH /informes/:alertaId/borrador con rol USER debe retornar 403', async () => {
      const res = await request(baseUrl)
        .patch(`/informes/${createdAlertaId}/borrador`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ observaciones_admin: 'test' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('No tiene permisos de administrador');
    });
  });

  describe('Usuario con rol ADMIN - Debería poder acceder', () => {
    it('GET /informes/:alertaId/borrador con rol ADMIN debe retornar 200', async () => {
      const res = await request(baseUrl)
        .get(`/informes/${createdAlertaId}/borrador`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('estado_informe', 'BORRADOR');
    });

    it('PATCH /informes/:alertaId/borrador con rol ADMIN debe retornar 200', async () => {
      const res = await request(baseUrl)
        .patch(`/informes/${createdAlertaId}/borrador`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ observaciones_admin: 'Observación de administrador AX-16', detalles_propiedad: 'Propiedad afectada test' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('observaciones_admin', 'Observación de administrador AX-16');
      expect(res.body).toHaveProperty('detalles_propiedad', 'Propiedad afectada test');
    });
  });
});
