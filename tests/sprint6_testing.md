# Reporte de Aseguramiento de Calidad (QA) - Sprint 6

**Rol:** Lau (QA Engineer Senior)
**Proyecto:** Axon Fire Backend
**Sprint:** 6 — Gestión de POIs (Points of Interest)
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

## Resultado Final de Tests Sprint 6

| Suite | Tests | Resultado |
|---|---|---|
| AX-GESTION-B1 (RBAC) | 8 | ✅ 8/8 PASS |
| AX-GESTION-B2 (CRUD) | 9 | ✅ 9/9 PASS |
| AX-GESTION-B3 (Validaciones Zod) | 14 | ✅ 14/14 PASS |
| **Total** | **31** | **✅ 31/31 PASS** |

---

## Cómo ejecutar

```bash
# Tests completos de POIs
npx jest tests/ax_gestion_pois.test.ts --verbose

# Solo RBAC + CRUD
npx jest tests/ax_gestion_pois.test.ts --verbose -t "AX-GESTION-B1|AX-GESTION-B2"

# Solo validaciones
npx jest tests/ax_gestion_pois.test.ts --verbose -t "AX-GESTION-B3"

# Todos los tests del proyecto
npx jest --verbose
```
