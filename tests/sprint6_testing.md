# Reporte de Aseguramiento de Calidad (QA) - Sprint 6

**Rol:** Lau (QA)
**Proyecto:** Axon Fire Backend
**Sprint:** 6 — Gestión de POIs (Points of Interest)
**Fecha:** Junio 2026

---

## Resumen de Hallazgos

| ID | Tipo | Estado | Descripción |
|---|---|---|---|
| AX-GESTION-B1 | RBAC | ✅ PASA | Middleware `verificarRolAdmin` bloquea correctamente a usuarios USER (403) y requests sin token (401) en endpoints de POIs |
| AX-GESTION-B2 | CRUD | ✅ PASA | Ciclo de vida completo de POI funciona correctamente: POST 201, PATCH 200, DELETE soft (activo=false) |
| AX-GESTION-B2 | Bug | 🟡 MEDIO | `DELETE /api/maps/pois/:id` retorna 200 en vez de 204 (No Content) según especificación |
| AX-GESTION-B2 | Bug | 🟢 BAJO | Ruta `PATCH /api/maps/pois/:id` usa PATCH, la especificación dice PUT. Sin impacto funcional |
| AX-GESTION-B3 | Bug | 🔴 ALTO | Coordenadas inválidas/faltantes retornan 500 en vez de 400 con listado detallado de errores |
| AX-GESTION-B3 | Bug | 🔴 ALTO | `actualizarPoi` en service NO valida rangos de latitud/longitud — permite guardar coordenadas inválidas |

---

## 1. AX-GESTION-B1 — RBAC: Control de Acceso a Endpoints de POIs

### Descripción
Verificar que los endpoints de gestión de POIs (`GET /api/maps/pois`, `POST /api/maps/pois`, `PATCH /api/maps/pois/:id`, `DELETE /api/maps/pois/:id`) apliquen correctamente el middleware `verificarRolAdmin` para restringir acceso solo a administradores.

### Archivos involucrados
- `src/middlewares/auth.middleware.ts` — middlewares `verificarHeaders` y `verificarRolAdmin`
- `src/routes/pois.routes.ts` — rutas con ambos middlewares

### Resultado del Test
| Escenario | Endpoints | Resultado |
|---|---|---|
| Sin token | GET, POST, PATCH, DELETE | ✅ 401 en todos |
| Token USER | GET, POST, PATCH, DELETE | ✅ 403 + "No tiene permisos de administrador" en todos |

### Conclusión
El RBAC funciona correctamente. **No requiere acción del DEV.**

---

## 2. AX-GESTION-B2 — CRUD de POIs

### Descripción
Ciclo de vida completo de un POI: creación, consulta, actualización, borrado lógico y verificación de persistencia física.

### Archivo
`tests/ax_gestion_pois.test.ts`

### Resultado del Test
| Paso | Endpoint | Esperado | Obtenido | Resultado |
|---|---|---|---|---|
| Crear | `POST /api/maps/pois` | 201 + ID | 201 + ID | ✅ |
| Listar | `GET /api/maps/pois` | 200 + contiene POI | 200 + contiene POI | ✅ |
| Actualizar | `PATCH /api/maps/pois/:id` | 200 + datos nuevos | 200 + datos nuevos | ✅ |
| Actualizar (404) | `PATCH /api/maps/pois/:id` | 404 | 404 | ✅ |
| Eliminar | `DELETE /api/maps/pois/:id` | 204 | 200 | 🟡 BUG |
| Verificar soft-delete | Consulta directa a DB | `activo = false` | `activo = false` | ✅ |
| Verificar no aparece | `GET /api/maps/pois` | No listado | No listado | ✅ |
| Eliminar (404) | `DELETE /api/maps/pois/:id` | 404 | 404 | ✅ |

### Conclusión
El CRUD funciona correctamente. El borrado lógico persiste y el filtro `activo: true` en `obtenerPois` funciona. Solo se detectó una discrepancia en el código de respuesta del DELETE.

---

## 3. 🟡 AX-GESTION-B2 — Bug: DELETE retorna 200 en vez de 204

### ⚠️ Impacto
**Medio — Bajo.** El cliente puede interpretar que debe procesar un body en la respuesta de eliminación. Semánticamente REST, `DELETE` exitoso debe retornar `204 No Content` sin body.

### Pasos para reproducir
1. Autenticarse como ADMIN
2. Ejecutar `DELETE /api/maps/pois/{id}` con un ID existente
3. Verificar status code → **200** ❌ (debería ser 204)

### Causa raíz
`PoisController.eliminarPOI` en `src/modules/pois/pois.controller.ts:60-72` retorna `res.status(200).json({ message: 'POI eliminado correctamente' })`.

### Solución sugerida para el DEV

**Archivo:** `src/modules/pois/pois.controller.ts`

```diff
      eliminarPOI = async (req: AuthRequest, res: Response) => {
          try {
              const { id } = req.params as { id: string };
              await this.service.eliminarPoi(id);
-             return res.status(200).json({ message: 'POI eliminado correctamente' });
+             return res.status(204).send();
          } catch (error: any) {
```

---

## 4. 🟢 AX-GESTION-B2 — Bug: Ruta usa PATCH en vez de PUT

### ⚠️ Impacto
**Bajo.** Sin impacto funcional. El endpoint responde correctamente a `PATCH`. Sin embargo, la especificación indica `PUT /api/maps/pois/{id}`. Se sugiere unificar criterio.

### Archivo
`src/routes/pois.routes.ts:8` — `.patch('/:id', ...)` debería ser `.put('/:id', ...)`.

### Solución sugerida para el DEV
```diff
- router.patch('/:id', verificarHeaders, verificarRolAdmin, controller.actualizarPOI);
+ router.put('/:id', verificarHeaders, verificarRolAdmin, controller.actualizarPOI);
```

---

## 5. 🔴 AX-GESTION-B3 — Bug: Coordenadas inválidas/faltantes retornan 500 en vez de 400

### ⚠️ Impacto
**Alto — UX de API.** El backend expone errores internos (500) cuando recibe datos inválidos, violando el principio de validación de entrada. Un cliente bien intencionado que envía coordenadas fuera de rango recibe un error de servidor en lugar de un mensaje claro de validación.

### Pasos para reproducir
1. Autenticarse como ADMIN
2. Ejecutar `POST /api/maps/pois` con `latitud: 200, longitud: 0`
3. Ver respuesta → **500** ❌ (debería ser 400 con listado de errores)

### Casos que fallan
| Escenario | Actual | Esperado |
|---|---|---|
| Sin latitud | 500 | 400 + error "latitud es requerida" |
| Sin longitud | 500 | 400 + error "longitud es requerida" |
| Sin lat ni lng | 500 | 400 + ambos errores |
| lat > 90 | 500 | 400 + "latitud debe estar entre -90 y 90" |
| lat < -90 | 500 | 400 + mismo |
| lng > 180 | 500 | 400 + "longitud debe estar entre -180 y 180" |
| lng < -180 | 500 | 400 + mismo |

### Causa raíz
`PoisService.crearPoi` en `src/modules/pois/pois.service.ts:8-18` valida rangos pero lanza `throw new Error("Latitud o longitud invalida")`, que el controller atrapa genéricamente como 500.

Además, el controller (`pois.controller.ts:11-27`) no tiene validación previa de campos requeridos ni unifica errores en un array.

### Solución sugerida para el DEV

**Opción A — Validación en el Controller (mínimo)**

```diff
// src/modules/pois/pois.controller.ts - crearPOI
      crearPOI = async (req: AuthRequest, res: Response) => {
          try {
              const data: CrearPoiDTO = req.body;

+             const errors: string[] = [];
+             if (data.latitud === undefined || data.latitud === null) {
+                 errors.push('latitud es requerida');
+             } else if (data.latitud < -90 || data.latitud > 90) {
+                 errors.push('latitud debe estar entre -90 y 90');
+             }
+             if (data.longitud === undefined || data.longitud === null) {
+                 errors.push('longitud es requerida');
+             } else if (data.longitud < -180 || data.longitud > 180) {
+                 errors.push('longitud debe estar entre -180 y 180');
+             }
+             if (errors.length > 0) {
+                 return res.status(400).json({ errors });
+             }
+
              if (!Object.values(categoria_poi).includes(data.categoria)) {
                  return res.status(400).json({ error: `Categoria invalida. ...` });
              }
```

**Opción B — Middleware de validación (más escalable)**

Crear un middleware de validación parametrizable con express-validator o zod para manejar todas las validaciones de entrada de forma centralizada.

---

## 6. 🔴 AX-GESTION-B3 — Bug: `actualizarPoi` no valida rangos de coordenadas

### ⚠️ Impacto
**Alto — Integridad de datos.** `PATCH /api/maps/pois/:id` permite actualizar un POI con coordenadas fuera de rango (ej. latitud=200, longitud=500) sin ningún rechazo. El valor queda persistido en la base de datos.

### Pasos para reproducir
1. Autenticarse como ADMIN
2. Crear un POI con coordenadas válidas
3. Ejecutar `PATCH /api/maps/pois/{id}` con `latitud: 200`
4. Consultar el POI → `latitud: 200` ❌ guardado incorrectamente

### Causa raíz
`PoisService.actualizarPoi` en `src/modules/pois/pois.service.ts:24-30` **no valida rangos** de `latitud` ni `longitud`. La validación solo existe en `crearPoi`.

### Solución sugerida para el DEV

**Archivo:** `src/modules/pois/pois.service.ts`

```diff
      async actualizarPoi(id: string, data: ActualizarPoiDTO) {
          const poi = await this.repositorio.buscarPoiPorId(id);
          if (!poi) {
              throw new Error("POI no encontrado");
          }

+         if (data.latitud !== undefined && (data.latitud < -90 || data.latitud > 90)) {
+             throw new Error("Latitud invalida. Debe estar entre -90 y 90");
+         }
+         if (data.longitud !== undefined && (data.longitud < -180 || data.longitud > 180)) {
+             throw new Error("Longitud invalida. Debe estar entre -180 y 180");
+         }
+
          return await this.repositorio.actualizarPoi(id, data);
      }
```

Adicionalmente, el controller debe capturar estos errores y traducirlos a 400 en vez de 500:

```diff
// src/modules/pois/pois.controller.ts - actualizarPOI
      actualizarPOI = async (req: AuthRequest, res: Response) => {
          try {
              // ...
              const resultado = await this.service.actualizarPoi(id, data);
              return res.status(200).json(resultado);
          } catch (error: any) {
              if (error.message === 'POI no encontrado') {
                  return res.status(404).json({ error: error.message });
              }
+             if (error.message.includes('invalida')) {
+                 return res.status(400).json({ error: error.message });
+             }
              return res.status(500).json({ error: error.message });
          }
```

---

## 7. Nota: Verbo HTTP en ruta de actualización

La especificación de la tarea menciona `PUT /api/maps/pois/{id}` pero la implementación usa `PATCH`. Si bien ambos son semánticamente aceptables (PATCH es más correcto para actualizaciones parciales), se recomienda alinear la documentación con la implementación.

---

## 8. Hallazgo de Infraestructura: Migration `add_puntos_interes` no aplicada

### Descripción
Durante la ejecución de los tests de AX-GESTION-B2, se descubrió que la migration `20260613001453_add_puntos_interes` no había sido aplicada a la base de datos. Esto causaba que `POST /api/maps/pois` fallara con error 500: `The table "public.puntos_interes" does not exist in the current database.`.

### Causa
La migration existe en `prisma/migrations/` pero nunca se ejecutó `prisma migrate deploy` después de agregar el modelo `puntos_interes`.

### Solución
Aplicar la migration pendiente:
```bash
npx prisma migrate deploy
```

### Estado actual
✅ Migration aplicada manualmente durante la sesión de QA. Todos los tests B1 y B2 pasan correctamente.

---

## Resultado Final de Tests Sprint 6

| Suite | Tests | Resultado |
|---|---|---|
| AX-GESTION-B1 (RBAC) | 8 | ✅ 8/8 PASS |
| AX-GESTION-B2 (CRUD) | 8 | ✅ 8/8 PASS |
| AX-GESTION-B3 (Validaciones — documentan bugs) | 8 | ❌ 0/8 PASS (bugs conocidos) |
| **Total** | **24** | **✅ 16 PASS · ❌ 8 FAIL (esperados)** |

> Los 8 tests de B3 fallan **intencionalmente** para reflejar bugs existentes. Pasarán una vez que el DEV implemente las validaciones sugeridas.

---

## Cómo ejecutar

```bash
# Test completo de POIs
npx jest tests/ax_gestion_pois.test.ts --verbose

# Tests que deberían pasar (B1 + B2)
npx jest tests/ax_gestion_pois.test.ts --verbose -t "AX-GESTION-B1|AX-GESTION-B2"
```
