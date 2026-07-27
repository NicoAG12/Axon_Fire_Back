import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-16: Validación de Permisos - Acceso a Borrador de Informes', () => {
  let adminToken: string = '';
  let userToken: string = '';

  describe('Endpoint /informes/:alertaId/borrador — Rutas comentadas en backend', () => {
    it('GET /informes/:alertaId/borrador — retorna 404 (ruta deshabilitada en informes.route.ts)', async () => {
      const res = await request(baseUrl)
        .get('/informes/any-id/borrador')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('PATCH /informes/:alertaId/borrador — retorna 404 (ruta deshabilitada en informes.route.ts)', async () => {
      const res = await request(baseUrl)
        .patch('/informes/any-id/borrador')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ observaciones_admin: 'test' });

      expect(res.status).toBe(404);
    });
  });
});
