# Reporte de Aseguramiento de Calidad (QA) - Sprint 6

**Rol:** Lau (QA Engineer Senior)
**Proyecto:** Axon Fire Backend
**Sprint:** 6 — Gestión de POIs (Points of Interest) + Maps Config + Incidents
**Fecha:** Junio 2026

---

## Resumen de Hallazgos

| ID | Tipo | Estado | Descripción |
|---|---|---|---|
| AX-GESTION-B1 | RBAC | ✅ PASA | Middleware `verificarRolAdmin` bloquea correctamente a usuarios USER (403) y requests sin token (401) en endpoints de POIs |
| AX-GESTION-B2 | CRUD | ✅ PASA | Ciclo de vida completo de POI funciona correctamente: POST 201, PATCH 200, DELETE soft (activo=false) |
| AX-GESTION-B2 | Feature | ✅ NUEVO | `GET /api/maps/pois?type=HIDRANTE` filtra por categoría |
| AX-GESTION-B3 | Validación | ✅ CORREGIDO | Zod middleware + schemas validan lat/lng/categoria/nombre vacío y retornan 400 con `{ errors: [{ path, message }] }` |
| AX-GESTION-B3 | PATCH | ✅ CORREGIDO | `actualizarPoiSchema` partial valida coordenadas si se envían en PATCH |
| Infra | QA | ✅ CORREGIDO | Migration `add_puntos_interes` no aplicada → aplicada manualmente |

**Contrato de referencia:** `tests/api-contracts/gestion-pois-api.yaml`

---

## 1. AX-GESTION-B1 — RBAC: Control de Acceso a Endpoints de POIs

### Descripción
Verificar que los endpoints de gestión de POIs apliquen correctamente el middleware `verificarRolAdmin` para restringir acceso solo a administradores.

### Archivos involucrados
- `src/middlewares/auth.middleware.ts` — middlewares `verificarHeaders` y `verificarRolAdmin`
- `src/routes/pois.routes.ts` — rutas con ambos middlewares

### Resultado del Test
| Escenario | Endpoints | Resultado |
|---|---|---|
| Sin token | GET, POST, PATCH, DELETE | ✅ 401 en todos |
| Token USER | GET, POST, PATCH, DELETE | ✅ 403 + "No tiene permisos de administrador" en todos |

### Conclusión
RBAC funciona correctamente. **No requiere acción del DEV.**

---

## 2. AX-GESTION-B2 — CRUD de POIs

### Descripción
Ciclo de vida completo de un POI: creación, consulta, actualización, borrado lógico y verificación de persistencia física. Se alinea con `tests/api-contracts/gestion-pois-api.yaml`.

### Archivo
`tests/ax_gestion_pois.test.ts`

### Resultado del Test
| Paso | Endpoint | Esperado | Obtenido | Resultado |
|---|---|---|---|---|
| Crear | `POST /api/maps/pois` | 201 + objeto con ID | 201 + objeto | ✅ |
| Listar | `GET /api/maps/pois` | 200 + array | 200 + array | ✅ |
| Filtrar | `GET /api/maps/pois?type=HIDRANTE` | 200 + solo HIDRANTE | 200 + filtrado | ✅ |
| Actualizar | `PATCH /api/maps/pois/:id` | 200 + datos nuevos | 200 + datos nuevos | ✅ |
| Actualizar (404) | `PATCH /api/maps/pois/:id` | 404 | 404 | ✅ |
| Eliminar | `DELETE /api/maps/pois/:id` | 200 (contract) | 200 + message | ✅ |
| Verificar soft-delete | Consulta directa a DB | `activo = false` | `activo = false` | ✅ |
| Verificar no aparece | `GET /api/maps/pois` | No listado | No listado | ✅ |
| Eliminar (404) | `DELETE /api/maps/pois/:id` | 404 | 404 | ✅ |

> Nota: DELETE retorna 200 (no 204) y se usa PATCH (no PUT) — ambos alineados con el API contract aprobado por Frontend. No son bugs.

---

## 3. AX-GESTION-B3 — Validaciones geográficas con Zod

### Descripción
Validación de entrada mediante middleware `validateData` con esquemas Zod. Se verifica que coordenadas inválidas, campos faltantes, categorías incorrectas y nombres vacíos sean rechazados con 400 y un listado estructurado de errores.

### Archivos involucrados (cambios del DEV)
- `src/middlewares/validateData.middleware.ts` — **nuevo** middleware genérico con Zod
- `src/modules/pois/DTO/pois_dto.ts` — reemplazo de interfaces por schemas Zod
- `src/routes/pois.routes.ts` — se agregó `validateData` a POST y PATCH

### Resultado del Test
| Escenario | Esperado | Obtenido | Resultado |
|---|---|---|---|
| POST sin latitud | 400 + errors[] | 400 + errors[] | ✅ |
| POST sin longitud | 400 + errors[] | 400 + errors[] | ✅ |
| POST sin lat ni lng | 400 + 2+ errores | 400 + 2 errores | ✅ |
| POST sin nombre | 400 + error "nombre" | 400 + error "nombre" | ✅ |
| POST nombre vacío | 400 | 400 | ✅ |
| lat > 90 | 400 + error "latitud" | 400 + error | ✅ |
| lat < -90 | 400 | 400 | ✅ |
| lng > 180 | 400 + error "longitud" | 400 + error | ✅ |
| lng < -180 | 400 | 400 | ✅ |
| PATCH lat inválida | 400 | 400 | ✅ |
| PATCH lng inválida | 400 | 400 | ✅ |
| PATCH categoria inválida | 400 | 400 | ✅ |
| POST categoria inválida | 400 | 400 | ✅ |
| GET ?type=INVALIDO | 400 | 400 | ✅ |

### Formato de error
```json
{
  "errors": [
    { "path": "latitud", "message": "La latitud debe estar entre -90 y 90" },
    { "path": "longitud", "message": "Required" }
  ]
}
```

### Conclusión
Validaciones corregidas exitosamente por el DEV. El middleware `validateData` es reutilizable para otros módulos. **No requiere acción adicional.**

---

## 4. Feature: Filtro por categoría en GET /api/maps/pois

El endpoint `GET /api/maps/pois` ahora acepta `?type=HIDRANTE` para filtrar POIs por categoría. Si el tipo es inválido, retorna 400.

No está documentado en el api contract actual (`gestion-pois-api.yaml`). Se sugiere actualizar el contrato si esta feature se considera parte de la especificación pública.

---

## 5. Hallazgo de Infraestructura: Migration `add_puntos_interes` no aplicada

### Descripción
Durante la ejecución de los tests en la primera ronda, se descubrió que la migration `20260613001453_add_puntos_interes` no había sido aplicada. Causaba error 500: `The table "public.puntos_interes" does not exist.`.

### Solución
```bash
npx prisma migrate deploy
```

### Estado
✅ Migration aplicada manualmente durante QA.

---

# Sprint 6 — Set 2: Maps Config, Incidents y POIs extendido

## Resumen de Hallazgos — Set 2

| ID | Tipo | Estado | Descripción |
|---|---|---|---|
| AX-S6-B1 | Config Map | ✅ PASA | `GET /api/maps/config` requiere token (401), devuelve `{ latitud, longitud }` con tipos correctos |
| AX-S6-B2 | Incidents | ✅ PASA | `GET /api/maps/incidents/:id` maneja 404, 400 y 200 correctamente con JSON completo |
| AX-S6-B3 | POIs | ✅ PASA | Filtrado por tipo, multi-cuartel, y estructura de array validados |
| AX-S6-INFRA-2 | Infra | ✅ CORREGIDO | Migration `add_coords_and_prioridad_to_alerta` no aplicada → aplicada manualmente durante QA |
| ~~AX-S6-BUG-1~~ | ~~Bug~~ | ~~🔴 CRÍTICO~~ | ~~`getConfig()` valida lat===0 && lng===0 como "no configurado" → imposible ubicar cuartel en (0,0)~~ — **DESCARTADO**: el mapa es solo para un cuartel de una ciudad pequeña, coordenadas (0,0) no aplican al dominio |
| ~~AX-S6-BUG-2~~ | ~~Bug~~ | ~~🟡 MEDIO~~ | ~~Faltan `CUARTEL_LAT` y `CUARTEL_LNG` en `.env`~~ — **DESCARTADO**: `.env` es personal de cada repositorio, el DEV lo configura localmente |

**Suite de tests:** `tests/ax_maps_sprint6_set2.test.ts`
**Contrato de referencia:** `API_MANUAL.md` (Sección 16 — Mapa Operativo)

---

## 6. AX-S6-B1 — Endpoint de configuración del mapa (GET /api/maps/config)

### Descripción
Validar que el endpoint `GET /api/maps/config` requiera autenticación, devuelva las coordenadas del cuartel con los tipos correctos, y maneje errores de configuración.

### Archivos involucrados
- `src/routes/maps.route.ts` — ruta con middleware `verificarHeaders`
- `src/modules/maps/maps.controller.ts` — handler `getConfig`
- `src/modules/maps/maps.service.ts` — lógica de lectura de env vars

### Resultado del Test

| Escenario | Esperado | Obtenido | Resultado |
|---|---|---|---|
| GET sin token | 401 | 401 `{ message }` | ✅ |
| GET con token inválido | 401 | 401 `{ message }` | ✅ |
| GET con token ADMIN válido | 200 + `{ latitud, longitud }` | 200 con ambas props | ✅ |
| Tipos de datos | `latitud: number`, `longitud: number` | Ambos son `number` | ✅ |
| Coordenadas ≠ 0,0 | Valores de Argentina | Valores reales | ✅ |

### Conclusión
RBAC funciona correctamente con `verificarHeaders`. La estructura de respuesta coincide con el API contract. **No requiere acción del DEV.**

---

## 7. AX-S6-B2 — Endpoint de incidente activo (GET /api/maps/incidents/:id)

### Descripción
Validar que el endpoint reciba un ID de incidente como parámetro, devuelva el JSON completo con Latitud, Longitud, Tipo de emergencia, Dirección exacta y Nivel de prioridad, y maneje correctamente los errores (404 y 400).

### Archivos involucrados
- `src/routes/maps.route.ts` — ruta con middleware `verificarHeaders`
- `src/modules/maps/maps.controller.ts` — handler `getIncident`
- `src/modules/maps/maps.service.ts` — lógica de búsqueda y validación
- `src/modules/maps/maps.repository.ts` — query a `alerta` con `findUnique` e include de `subCategoriaAlerta`

### Resultado del Test

| Escenario | Esperado | Obtenido | Resultado |
|---|---|---|---|
| GET sin token | 401 | 401 | ✅ |
| ID inexistente | 404 + `"El incidente no existe"` | 404 + mensaje exacto | ✅ |
| Alerta sin coordenadas (lat/lng null) | 400 + `"El incidente no tiene coordenadas válidas"` | 400 + mensaje exacto | ✅ |
| Alerta con coordenadas válidas | 200 + JSON completo | 200 con 5 campos | ✅ |
| `latitud` type | `number` | `number` | ✅ |
| `longitud` type | `number` | `number` | ✅ |
| `tipo_emergencia` type | `string` | `string` | ✅ |
| `direccion_exacta` type | `string` | `string` | ✅ |
| `nivel_prioridad` type | `string` (enum: ALTA/MEDIA/BAJA) | `string`, valor válido | ✅ |

### JSON de respuesta validado
```json
{
  "latitud": -26.8072,
  "longitud": -65.2927,
  "tipo_emergencia": "INCENDIO ESTRUCTURAL",
  "direccion_exacta": "Av. Siempreviva 742, Springfield",
  "nivel_prioridad": "ALTA"
}
```

### Conclusión
El endpoint cumple con el API contract. Manejo de errores correcto con mensajes claros. **No requiere acción del DEV.**

---

## 8. AX-S6-B3 — POIs: Filtrado, multi-cuartel y estructura

### Descripción
Validar que `GET /api/maps/pois` filtre correctamente por tipo de POI via query param `?type=`, que incluya POIs de toda la red (sin filtro por cuartel/creador), y que cada POI en el array tenga la estructura correcta con tipos de datos adecuados.

### Archivos involucrados
- `src/routes/pois.routes.ts` — ruta con middleware `verificarHeaders` + `verificarRolAdmin`
- `src/modules/pois/pois.controller.ts` — handler `obtenerPOIs`
- `src/modules/pois/pois.service.ts` — lógica de filtrado (delega al repo)
- `src/modules/pois/pois.repository.ts` — query `findMany` con filtro `activo: true` y `categoria` opcional

### Resultado del Test

#### B3.1 — Filtrado por tipo

| Escenario | Esperado | Obtenido | Resultado |
|---|---|---|---|
| `?type=HIDRANTE` | Solo HIDRANTE | Solo HIDRANTE | ✅ |
| `?type=MATERIAL_PELIGROSO` | Solo MATERIAL_PELIGROSO | Solo MATERIAL_PELIGROSO | ✅ |
| `?type=SALUD` | Solo SALUD | Solo SALUD | ✅ |
| `?type=INVALIDO` | 400 | 400 | ✅ |
| Sin type | Todas las categorías | HIDRANTE + SALUD + otras | ✅ |

#### B3.2 — Multi-cuartel (red completa)

| Escenario | Esperado | Obtenido | Resultado |
|---|---|---|---|
| POIs de distintos creadores | Todos visibles | Todos visibles | ✅ |
| No existe filtro por cuartel | No hay `?cuartel_id=` | No hay filtro de ese tipo | ✅ |
| `creado_por` presente en cada POI | string UUID | string UUID | ✅ |

#### B3.3 — Estructura del array

| Campo | Tipo | Requerido | Resultado |
|---|---|---|---|
| `id` | `string` (UUID) | Sí | ✅ |
| `categoria` | `string` (enum: HIDRANTE/SALUD/MATERIAL_PELIGROSO/CUARTEL_APOYO) | Sí | ✅ |
| `nombre` | `string` (non-empty) | Sí | ✅ |
| `descripcion` | `string` o `null` | No | ✅ |
| `latitud` | `number` (finite) | Sí | ✅ |
| `longitud` | `number` (finite) | Sí | ✅ |
| `creado_por` | `string` (UUID) | Sí | ✅ |

### Conclusión
POIs funcionan correctamente. Filtrado, visibilidad multi-cuartel y estructura de datos validados. **No requiere acción del DEV.**

---

## 9. AX-S6-INFRA-2: Migration `add_coords_and_prioridad_to_alerta` no aplicada

### Descripción
Durante la ejecución de los tests de B2, se descubrió que la migration `20260614174430_add_coords_and_prioridad_to_alerta` no había sido aplicada. Causaba error 500 al intentar crear una alerta con coordenadas:

```
The column "latitud of relation alerta" does not exist in the current database.
```

Esta migration agrega las columnas `latitud`, `longitud` y `prioridad` (enum `nivel_prioridad`) a la tabla `alerta`. Sin ella, el endpoint `GET /api/maps/incidents/:id` no puede ejecutar queries en la tabla alerta correctamente, retornando 500 en lugar de 404 o 400.

### Solución
```bash
npx prisma migrate deploy
```

### Estado
✅ Migration aplicada manualmente durante QA. **Idéntico al hallazgo previo AX-GESTION (migration `add_puntos_interes`).** Se recomienda al DEV validar que el CI/CD ejecute `prisma migrate deploy` automáticamente en cada deploy.

---

<!-- AX-S6-BUG-1 descartado por decisión de QA: el mapa es para un cuartel de ciudad pequeña en Argentina, coordenadas (0,0) no son relevantes para el dominio. -->

<!-- AX-S6-BUG-2 descartado por decisión de QA: .env es personal de cada repositorio, no se trackea en git. El DEV lo configura localmente. -->## Resultado Final de Tests Sprint 6

### Set 1 (GESTION POIs)

| Suite | Tests | Resultado |
|---|---|---|
| AX-GESTION-B1 (RBAC) | 8 | ✅ 8/8 PASS |
| AX-GESTION-B2 (CRUD) | 9 | ✅ 9/9 PASS |
| AX-GESTION-B3 (Validaciones Zod) | 14 | ✅ 14/14 PASS |
| **Subtotal Set 1** | **31** | **✅ 31/31 PASS** |

### Set 2 (Maps Config + Incidents + POIs extendido)

| Suite | Tests | Resultado |
|---|---|---|
| AX-S6-B1 (Config Map) | 4 | ✅ 4/4 PASS |
| AX-S6-B2 (Incidents) | 5 | ✅ 5/5 PASS |
| AX-S6-B3 (POIs extendido) | 9 | ✅ 9/9 PASS |
| **Subtotal Set 2** | **18** | **✅ 18/18 PASS** |

### Total general Sprint 6

| Suite | Tests | Resultado |
|---|---|---|
| **Total Sprint 6** | **49** | **✅ 49/49 PASS** |

---

## Cómo ejecutar

```bash
# Tests completos de POIs (Set 1)
npx jest tests/ax_gestion_pois.test.ts --verbose

# Tests de Maps Config + Incidents + POIs extendido (Set 2)
npx jest tests/ax_maps_sprint6_set2.test.ts --verbose

# Solo B1 — Config
npx jest tests/ax_maps_sprint6_set2.test.ts --verbose -t "B1"

# Solo B2 — Incidents
npx jest tests/ax_maps_sprint6_set2.test.ts --verbose -t "B2"

# Solo B3 — POIs extendido
npx jest tests/ax_maps_sprint6_set2.test.ts --verbose -t "B3"

# Todos los tests del proyecto
npx jest --verbose
```

## Precondiciones

Antes de ejecutar los tests, asegurar:

1. **Variables de entorno:** `CUARTEL_LAT` y `CUARTEL_LNG` configuradas en `.env`
2. **Migraciones aplicadas:** `npx prisma migrate deploy`
3. **Seed ejecutado:** `npx tsx prisma/seed.ts`
4. **Servidor corriendo:** `npm run dev`
5. **Tests apuntan al servidor:** `TEST_URL` (default: `http://localhost:3000`)
