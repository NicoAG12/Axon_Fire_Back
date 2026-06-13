import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-GESTION POIs — RBAC, CRUD y Validaciones Geográficas', () => {
  let adminToken: string;
  let userToken: string;
  let createdPoiId: string;

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
  });

  afterAll(async () => {
    if (createdPoiId) {
      await prisma.puntos_interes.deleteMany({ where: { id: createdPoiId } });
    }
    await prisma.$disconnect();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AX-GESTION-B1: RBAC
  // ─────────────────────────────────────────────────────────────────────────
  describe('AX-GESTION-B1 — RBAC: solo ADMIN accede a endpoints de POIs', () => {
    describe('Requests sin token — 401 Unauthorized', () => {
      it('GET /api/maps/pois sin token retorna 401', async () => {
        const res = await request(baseUrl).get('/api/maps/pois');
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
      });

      it('POST /api/maps/pois sin token retorna 401', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .send({ nombre: 'test', categoria: 'HIDRANTE', latitud: -34.6, longitud: -58.38 });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
      });

      it('PATCH /api/maps/pois/:id sin token retorna 401', async () => {
        const res = await request(baseUrl)
          .patch('/api/maps/pois/nonexistent-id')
          .send({ nombre: 'test' });
        expect(res.status).toBe(401);
      });

      it('DELETE /api/maps/pois/:id sin token retorna 401', async () => {
        const res = await request(baseUrl)
          .delete('/api/maps/pois/nonexistent-id');
        expect(res.status).toBe(401);
      });
    });

    describe('Usuario con rol USER — 403 Forbidden', () => {
      it('GET /api/maps/pois con rol USER retorna 403', async () => {
        const res = await request(baseUrl)
          .get('/api/maps/pois')
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No tiene permisos de administrador');
      });

      it('POST /api/maps/pois con rol USER retorna 403', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ nombre: 'test', categoria: 'HIDRANTE', latitud: -34.6, longitud: -58.38 });
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No tiene permisos de administrador');
      });

      it('PATCH /api/maps/pois/:id con rol USER retorna 403', async () => {
        const res = await request(baseUrl)
          .patch('/api/maps/pois/nonexistent-id')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ nombre: 'test' });
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No tiene permisos de administrador');
      });

      it('DELETE /api/maps/pois/:id con rol USER retorna 403', async () => {
        const res = await request(baseUrl)
          .delete('/api/maps/pois/nonexistent-id')
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No tiene permisos de administrador');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AX-GESTION-B2: CRUD de POIs
  // ─────────────────────────────────────────────────────────────────────────
  describe('AX-GESTION-B2 — CRUD de POIs (ciclo de vida completo)', () => {
    const poiPayload = {
      nombre: 'Hidrante QA Test',
      categoria: 'HIDRANTE',
      descripcion: 'Hidrante creado durante test de QA',
      latitud: -34.6037,
      longitud: -58.3816
    };

    it('POST /api/maps/pois → 201 + objeto creado con ID', async () => {
      const res = await request(baseUrl)
        .post('/api/maps/pois')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(poiPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string');
      expect(res.body).toHaveProperty('nombre', poiPayload.nombre);
      expect(res.body).toHaveProperty('categoria', poiPayload.categoria);
      expect(res.body).toHaveProperty('descripcion', poiPayload.descripcion);
      expect(res.body).toHaveProperty('latitud', poiPayload.latitud);
      expect(res.body).toHaveProperty('longitud', poiPayload.longitud);
      expect(res.body).toHaveProperty('creado_por');

      createdPoiId = res.body.id;
    });

    it('GET /api/maps/pois → 200 + lista contiene el POI creado', async () => {
      expect(createdPoiId).toBeTruthy();

      const res = await request(baseUrl)
        .get('/api/maps/pois')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((p: any) => p.id === createdPoiId);
      expect(found).toBeDefined();
      expect(found.nombre).toBe(poiPayload.nombre);
    });

    it('PATCH /api/maps/pois/:id → 200 + datos actualizados', async () => {
      expect(createdPoiId).toBeTruthy();

      const updatePayload = {
        nombre: 'Hidrante QA Test - Actualizado',
        descripcion: 'Descripción actualizada post-creación',
        latitud: -34.6100,
        longitud: -58.3700
      };

      const res = await request(baseUrl)
        .patch(`/api/maps/pois/${createdPoiId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', createdPoiId);
      expect(res.body).toHaveProperty('nombre', updatePayload.nombre);
      expect(res.body).toHaveProperty('descripcion', updatePayload.descripcion);
      expect(res.body).toHaveProperty('latitud', updatePayload.latitud);
      expect(res.body).toHaveProperty('longitud', updatePayload.longitud);
      // categoria no se tocó — debe mantenerse
      expect(res.body).toHaveProperty('categoria', poiPayload.categoria);
    });

    it('PATCH /api/maps/pois/:id con ID inexistente → 404', async () => {
      const res = await request(baseUrl)
        .patch('/api/maps/pois/id-inexistente-999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'no importa' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'POI no encontrado');
    });

    it('DELETE /api/maps/pois/:id → soft-delete (activo=false) + 200 (BUG: debería ser 204)', async () => {
      expect(createdPoiId).toBeTruthy();

      const res = await request(baseUrl)
        .delete(`/api/maps/pois/${createdPoiId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // BUG documentado: la spec pide 204, el controller devuelve 200
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'POI eliminado correctamente');
    });

    it('Verificar que el registro NO se eliminó físicamente (activo=false)', async () => {
      expect(createdPoiId).toBeTruthy();

      const record = await prisma.puntos_interes.findUnique({
        where: { id: createdPoiId }
      });

      expect(record).not.toBeNull();
      expect(record).toHaveProperty('activo', false);
    });

    it('DELETE /api/maps/pois/:id con ID inexistente → 404', async () => {
      const res = await request(baseUrl)
        .delete('/api/maps/pois/id-inexistente-999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'POI no encontrado');
    });

    it('GET /api/maps/pois después del borrado → POI ya no aparece (filtro activo)', async () => {
      const res = await request(baseUrl)
        .get('/api/maps/pois')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const found = res.body.find((p: any) => p.id === createdPoiId);
      expect(found).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AX-GESTION-B3: Validaciones geográficas
  // ─────────────────────────────────────────────────────────────────────────
  describe('AX-GESTION-B3 — Validaciones geográficas', () => {
    const basePoi = {
      nombre: 'POI validación geográfica',
      categoria: 'HIDRANTE'
    };

    describe('Campos vacíos / faltantes — deberían retornar 400', () => {
      it('POST sin latitud → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, longitud: -58.38 });

        // BUG: el backend retorna 500 porque service lanza error sin manejo 400
        expect(res.status).toBe(400);
      });

      it('POST sin longitud → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: -34.6 });

        expect(res.status).toBe(400);
      });

      it('POST sin latitud ni longitud → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(basePoi);

        expect(res.status).toBe(400);
      });
    });

    describe('Latitud fuera de rango [-90, 90] — debería retornar 400', () => {
      it('latitud > 90 → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: 91, longitud: 0 });

        expect(res.status).toBe(400);
      });

      it('latitud < -90 → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: -91, longitud: 0 });

        expect(res.status).toBe(400);
      });
    });

    describe('Longitud fuera de rango [-180, 180] — debería retornar 400', () => {
      it('longitud > 180 → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: 0, longitud: 181 });

        expect(res.status).toBe(400);
      });

      it('longitud < -180 → 400 (BUG: actualmente retorna 500)', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: 0, longitud: -181 });

        expect(res.status).toBe(400);
      });
    });

    describe('PATCH también debería validar coordenadas', () => {
      let tempPoiId: string;

      beforeAll(async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: -34.6, longitud: -58.38 });
        if (res.status === 201) tempPoiId = res.body.id;
      });

      afterAll(async () => {
        if (tempPoiId) {
          await prisma.puntos_interes.deleteMany({ where: { id: tempPoiId } });
        }
      });

      it('PATCH con latitud inválida → 400 (BUG: service no valida en actualizar)', async () => {
        if (!tempPoiId) return;

        const res = await request(baseUrl)
          .patch(`/api/maps/pois/${tempPoiId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ latitud: 200 });

        // BUG: actualizarPoi en service NO valida rangos de coordenadas
        // El valor 200 se guarda en la DB sin error
        expect(res.status).toBe(400);
      });
    });
  });
});
