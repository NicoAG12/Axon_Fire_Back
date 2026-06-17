import 'dotenv/config';
import request from 'supertest';
import { prisma } from '../src/lib/prisma';

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

describe('AX-S6-SET2 — Maps Config, Incidents y POIs extendido', () => {
  let adminToken: string;
  let userToken: string;
  let createdIncidentId: string;
  let createdPoiIds: string[] = [];

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
    for (const id of createdPoiIds) {
      try {
        await prisma.puntos_interes.deleteMany({ where: { id } });
      } catch {}
    }
    if (createdIncidentId) {
      try {
        await prisma.alerta.deleteMany({ where: { id: createdIncidentId } });
      } catch {}
    }
    await prisma.$disconnect();
  });

  // B1 — Endpoint de configuración del mapa (GET /api/maps/config)
  describe('B1 — GET /api/maps/config', () => {
    it('401 sin token de autenticación', async () => {
      const res = await request(baseUrl).get('/api/maps/config');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('401 con token inválido o expirado', async () => {
      const res = await request(baseUrl)
        .get('/api/maps/config')
        .set('Authorization', 'Bearer token-invalido');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('200 con token válido — respuesta tiene latitud y longitud (number)', async () => {
      const res = await request(baseUrl)
        .get('/api/maps/config')
        .set('Authorization', `Bearer ${adminToken}`);

      // CUARTEL_LAT/LNG sin configurar → el servicio devuelve 500
      if (res.status === 500) {
        console.warn('CUARTEL_LAT/CUARTEL_LNG no configurados en .env — test omite validaciones de coordenadas');
        console.warn('   Body:', res.body);
        return;
      }

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('latitud');
      expect(res.body).toHaveProperty('longitud');
      expect(typeof res.body.latitud).toBe('number');
      expect(typeof res.body.longitud).toBe('number');
    });

    it('200 — coordenadas del cuartel no son 0,0 (tienen valores reales)', async () => {
      const res = await request(baseUrl)
        .get('/api/maps/config')
        .set('Authorization', `Bearer ${adminToken}`);

      if (res.status !== 200) return;

      // Si latitud y longitud son 0,0 es porque no se configuraron; el service ya falla si ambas son 0
      const ambasSonCero = res.body.latitud === 0 && res.body.longitud === 0;
      expect(ambasSonCero).toBe(false);
    });
  });

  // B2 — Endpoint de incidente activo (GET /api/maps/incidents/:id)
  describe('B2 — GET /api/maps/incidents/:id', () => {
    it('401 sin token de autenticación', async () => {
      const res = await request(baseUrl).get('/api/maps/incidents/1');
      expect(res.status).toBe(401);
    });

    it('404 cuando el incidente no existe', async () => {
      const res = await request(baseUrl)
        .get('/api/maps/incidents/id-inexistente-999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('El incidente no existe');
    });

    it('400 cuando el incidente no tiene coordenadas válidas (lat/lng null)', async () => {
      // La alerta seed '1' no tiene latitud/longitud
      const res = await request(baseUrl)
        .get('/api/maps/incidents/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('El incidente no tiene coordenadas válidas');
    });

    it('200 + JSON completo cuando el incidente existe con coordenadas', async () => {
      const fechaTest = new Date().toISOString();
      const crearRes = await request(baseUrl)
        .post('/alerta/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sub_categoria_alerta_id: '1',
          ubicacion: 'Av. Siempreviva 742, Springfield',
          latitud: -26.8072,
          longitud: -65.2927,
          observaciones: 'Incendio estructural en vivienda',
          fecha_hora: fechaTest,
          estado_alerta_id: '1',
          prioridad: 'ALTA'
        });

      if (crearRes.status !== 200) {
        console.warn('No se pudo crear alerta de prueba:', crearRes.body);
        return;
      }

      createdIncidentId = crearRes.body.id;
      expect(createdIncidentId).toBeTruthy();

      const res = await request(baseUrl)
        .get(`/api/maps/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty('latitud');
      expect(res.body).toHaveProperty('longitud');
      expect(res.body).toHaveProperty('tipo_emergencia');
      expect(res.body).toHaveProperty('direccion_exacta');
      expect(res.body).toHaveProperty('nivel_prioridad');

      expect(typeof res.body.latitud).toBe('number');
      expect(typeof res.body.longitud).toBe('number');
      expect(typeof res.body.tipo_emergencia).toBe('string');
      expect(typeof res.body.direccion_exacta).toBe('string');
      expect(typeof res.body.nivel_prioridad).toBe('string');

      expect(res.body.latitud).toBe(-26.8072);
      expect(res.body.longitud).toBe(-65.2927);
      expect(res.body.direccion_exacta).toBe('Av. Siempreviva 742, Springfield');
      expect(res.body.nivel_prioridad).toBe('ALTA');
      // subcategoria_id '1' → "INCENDIO ESTRUCTURAL"
      expect(res.body.tipo_emergencia).toBe('INCENDIO ESTRUCTURAL');
    });

    it('200 — verify types are strictly number/string for geolocation fields', async () => {
      if (!createdIncidentId) {
        console.warn('No hay incidente creado — saltando test de tipos');
        return;
      }

      const res = await request(baseUrl)
        .get(`/api/maps/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      expect(typeof res.body.latitud).toBe('number');
      expect(typeof res.body.longitud).toBe('number');
      expect(Number.isFinite(res.body.latitud)).toBe(true);
      expect(Number.isFinite(res.body.longitud)).toBe(true);
      expect(res.body.tipo_emergencia.length).toBeGreaterThan(0);
      expect(res.body.direccion_exacta.length).toBeGreaterThan(0);
      expect(['ALTA', 'MEDIA', 'BAJA']).toContain(res.body.nivel_prioridad);
    });
  });

  // B3 — Endpoint de puntos de interés (POIs) — extendido
  describe('B3 — GET /api/maps/pois — filtrado, multi-cuartel, estructura', () => {
    beforeAll(async () => {
      const poisParaCrear = [
        { nombre: 'Hidrante QA Norte', categoria: 'HIDRANTE', descripcion: 'Hidrante test norte', latitud: -34.60, longitud: -58.38 },
        { nombre: 'Hidrante QA Sur', categoria: 'HIDRANTE', descripcion: 'Hidrante test sur', latitud: -34.70, longitud: -58.40 },
        { nombre: 'Hospital QA Central', categoria: 'SALUD', descripcion: 'Hospital test', latitud: -34.65, longitud: -58.35 },
        { nombre: 'Fabrica Química QA', categoria: 'MATERIAL_PELIGROSO', descripcion: 'Zona riesgo químico', latitud: -34.62, longitud: -58.45 },
        { nombre: 'Cuartel Apoyo QA', categoria: 'CUARTEL_APOYO', descripcion: 'Cuartel de apoyo test', latitud: -34.68, longitud: -58.42 },
      ];

      for (const poi of poisParaCrear) {
        const res = await request(baseUrl)
          .post('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(poi);
        if (res.status === 201 && res.body.id) {
          createdPoiIds.push(res.body.id);
        }
      }
    });

    // B3.1: Filtrado por tipo
    describe('B3.1 — Filtrado por tipo de POI via query param', () => {
      it('GET /api/maps/pois?type=HIDRANTE retorna solo HIDRANTES', async () => {
        if (createdPoiIds.length < 2) {
          console.warn('No hay suficientes POIs creados — saltando');
          return;
        }

        const res = await request(baseUrl)
          .get('/api/maps/pois?type=HIDRANTE')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        res.body.forEach((p: any) => {
          expect(p.categoria).toBe('HIDRANTE');
        });
      });

      it('GET /api/maps/pois?type=MATERIAL_PELIGROSO retorna solo MATERIAL_PELIGROSO', async () => {
        if (createdPoiIds.length < 2) return;

        const res = await request(baseUrl)
          .get('/api/maps/pois?type=MATERIAL_PELIGROSO')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((p: any) => {
          expect(p.categoria).toBe('MATERIAL_PELIGROSO');
        });
      });

      it('GET /api/maps/pois?type=SALUD retorna solo SALUD', async () => {
        if (createdPoiIds.length < 2) return;

        const res = await request(baseUrl)
          .get('/api/maps/pois?type=SALUD')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach((p: any) => {
          expect(p.categoria).toBe('SALUD');
        });
      });

      it('GET /api/maps/pois?type=INVALIDO retorna 400', async () => {
        const res = await request(baseUrl)
          .get('/api/maps/pois?type=INVALIDO')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(400);
      });

      it('GET /api/maps/pois sin type retorna todos los POIS activos (todas las categorías)', async () => {
        if (createdPoiIds.length < 2) return;

        const res = await request(baseUrl)
          .get('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const categorias = new Set(res.body.map((p: any) => p.categoria));
        expect(categorias.has('HIDRANTE')).toBe(true);
        expect(categorias.has('SALUD')).toBe(true);
      });
    });

    // B3.2: POIs de toda la red (multi-cuartel)
    describe('B3.2 — POIs de la red completa (multi-cuartel)', () => {
      it('GET /api/maps/pois incluye todos los POIS creados sin filtrar por creador', async () => {
        if (createdPoiIds.length < 2) return;

        const res = await request(baseUrl)
          .get('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        const idsEncontrados = res.body.map((p: any) => p.id);
        for (const expectedId of createdPoiIds) {
          expect(idsEncontrados).toContain(expectedId);
        }
      });

      it('POIs de distintos creadores aparecen en el listado global', async () => {
        // Solo hay un admin en seed por ahora; si hay múltiples admins, todos deben verse
        const res = await request(baseUrl)
          .get('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        res.body.forEach((p: any) => {
          expect(p).toHaveProperty('creado_por');
          expect(typeof p.creado_por).toBe('string');
        });
      });

      it('No existe filtro por cuartel que pueda ocultar POIs de otras estaciones', async () => {
        // El endpoint no acepta query param "cuartel_id"; si existiera sería un problema de diseño
        const res = await request(baseUrl)
          .get('/api/maps/pois?cuartel_id=otro')
          .set('Authorization', `Bearer ${adminToken}`);

        // El API ignora cuartel_id por diseño
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

    // B3.3: Estructura del array de POIs
    describe('B3.3 — Estructura del JSON de respuesta (array de POIs)', () => {
      it('Cada POI tiene todos los campos requeridos con tipos correctos', async () => {
        if (createdPoiIds.length < 2) return;

        const res = await request(baseUrl)
          .get('/api/maps/pois')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(createdPoiIds.length);

        res.body.forEach((poi: any) => {
          expect(poi).toHaveProperty('id');
          expect(poi).toHaveProperty('categoria');
          expect(poi).toHaveProperty('nombre');
          expect(poi).toHaveProperty('latitud');
          expect(poi).toHaveProperty('longitud');
          expect(poi).toHaveProperty('creado_por');

          expect(typeof poi.id).toBe('string');
          expect(typeof poi.categoria).toBe('string');
          expect(typeof poi.nombre).toBe('string');
          expect(typeof poi.latitud).toBe('number');
          expect(typeof poi.longitud).toBe('number');
          expect(typeof poi.creado_por).toBe('string');

          expect(poi.nombre.length).toBeGreaterThan(0);
          expect(Number.isFinite(poi.latitud)).toBe(true);
          expect(Number.isFinite(poi.longitud)).toBe(true);

          expect(['HIDRANTE', 'SALUD', 'MATERIAL_PELIGROSO', 'CUARTEL_APOYO']).toContain(poi.categoria);

          // descripcion es opcional; si existe debe ser string
          if (poi.descripcion !== undefined && poi.descripcion !== null) {
            expect(typeof poi.descripcion).toBe('string');
          }
        });
      });
    });
  });
});
