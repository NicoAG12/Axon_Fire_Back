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

  // AX-GESTION-B1: RBAC
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

  // AX-GESTION-B2: CRUD de POIs
  describe('AX-GESTION-B2 — CRUD de POIs (ciclo de vida completo)', () => {
    const poiPayload = {
      nombre: 'Hidrante QA Test',
      categoria: 'HIDRANTE' as const,
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

    it('GET /api/maps/pois?type=HIDRANTE → filtra por categoría', async () => {
      const res = await request(baseUrl)
        .get('/api/maps/pois?type=HIDRANTE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((p: any) => {
        expect(p.categoria).toBe('HIDRANTE');
      });
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
      // categoria no se tocó, debe mantenerse
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

    it('DELETE /api/maps/pois/:id → soft-delete (activo=false) + 200', async () => {
      expect(createdPoiId).toBeTruthy();

      const res = await request(baseUrl)
        .delete(`/api/maps/pois/${createdPoiId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // El contrato define 200 para DELETE (borrado lógico)
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

  // AX-GESTION-B3: Validaciones geográficas (ahora con Zod middleware)
  describe('AX-GESTION-B3 — Validaciones geográficas', () => {
    const basePoi = {
      nombre: 'POI validación geográfica',
      categoria: 'HIDRANTE' as const
    };

    describe('Campos requeridos faltantes — 400 Bad Request', () => {
      it('POST sin latitud retorna 400 con errors detallado', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, longitud: -58.38 });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors[0]).toHaveProperty('path');
        expect(res.body.errors[0]).toHaveProperty('message');
      });

      it('POST sin longitud retorna 400 con errors detallado', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: -34.6 });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

      it('POST sin latitud ni longitud retorna 400 con ambos errores', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(basePoi);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
      });

      it('POST sin nombre retorna 400 con error de nombre', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ categoria: 'HIDRANTE', latitud: -34.6, longitud: -58.38 });

        expect(res.status).toBe(400);
        const errorPaths = res.body.errors.map((e: any) => e.path);
        expect(errorPaths).toContain('nombre');
      });

      it('POST con nombre vacío retorna 400', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, nombre: '', latitud: -34.6, longitud: -58.38 });

        expect(res.status).toBe(400);
      });
    });

    describe('Latitud fuera de rango [-90, 90] — 400 Bad Request', () => {
      it('latitud > 90 rechazada', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: 91, longitud: 0 });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        const latErrors = res.body.errors.filter((e: any) => e.path === 'latitud');
        expect(latErrors.length).toBeGreaterThanOrEqual(1);
      });

      it('latitud < -90 rechazada', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: -91, longitud: 0 });

        expect(res.status).toBe(400);
      });
    });

    describe('Longitud fuera de rango [-180, 180] — 400 Bad Request', () => {
      it('longitud > 180 rechazada', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: 0, longitud: 181 });

        expect(res.status).toBe(400);
        const lngErrors = res.body.errors.filter((e: any) => e.path === 'longitud');
        expect(lngErrors.length).toBeGreaterThanOrEqual(1);
      });

      it('longitud < -180 rechazada', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, latitud: 0, longitud: -181 });

        expect(res.status).toBe(400);
      });
    });

    describe('PATCH también valida coordenadas (Zod partial schema)', () => {
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

      it('PATCH con latitud inválida → 400', async () => {
        if (!tempPoiId) return;

        const res = await request(baseUrl)
          .patch(`/api/maps/pois/${tempPoiId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ latitud: 200 });

        expect(res.status).toBe(400);
        const latErrors = res.body.errors.filter((e: any) => e.path === 'latitud');
        expect(latErrors.length).toBeGreaterThanOrEqual(1);
      });

      it('PATCH con longitud inválida → 400', async () => {
        if (!tempPoiId) return;

        const res = await request(baseUrl)
          .patch(`/api/maps/pois/${tempPoiId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ longitud: 500 });

        expect(res.status).toBe(400);
      });

      it('PATCH con categoria inválida → 400', async () => {
        if (!tempPoiId) return;

        const res = await request(baseUrl)
          .patch(`/api/maps/pois/${tempPoiId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ categoria: 'NO_EXISTE' });

        expect(res.status).toBe(400);
      });
    });

    describe('Categoría inválida — 400 Bad Request', () => {
      it('POST con categoria inválida rechazada', async () => {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ...basePoi, categoria: 'INVENTADA', latitud: -34.6, longitud: -58.38 });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
      });
    });

    describe('GET con type inválido — 400 Bad Request', () => {
      it('GET /api/maps/pois?type=INVALIDO retorna 400', async () => {
        const res = await request(baseUrl)
          .get('/api/maps/pois?type=INVALIDO')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(400);
      });
    });
  });
});
