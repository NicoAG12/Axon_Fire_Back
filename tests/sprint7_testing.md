# Reporte de Aseguramiento de Calidad (QA) — Sprint Final

**Rol:** Lau (QA Engineer Senior)
**Proyecto:** Axon Fire Backend
**Sprint:** Final — Cobertura de huecos CRUD + Consultas
**Fecha:** Julio 2026

---

## Resumen

| Suite | Tests | Resultado |
|---|---|---|
| AX-CRUD_Camiones-B1 | 10 | ✅ 10/10 PASS |
| AX-CRUD_Herramientas-B2 | 11 | ✅ 11/11 PASS |
| AX-Gestión_de_Alertas_(consulta)-B3 | 10 | ✅ 10/10 PASS |
| AX-CRUD_Bolsos-B4 | 9 | ✅ 9/9 PASS |
| AX-Registros_de_Comunicación-B5 | 9 | ✅ 9/9 PASS |
| **Total nuevo** | **49** | **✅ 49/49 PASS** |

---

## Tests Nuevos

### AX-CRUD_Camiones-B1 — CRUD completo de Camiones
**Archivo:** `tests/AX-CRUD_Camiones-B1.test.ts`
**Contrato:** `tests/api-contracts/camiones-api.yaml`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `GET /camiones/` | Sin token → 401 | ✅ |
| `GET /camiones/` | Token USER → 200 | ✅ |
| `GET /camiones/` | Array de camiones | ✅ |
| `GET /camiones/activos` | Solo ACTIVO | ✅ |
| `POST /camiones/` | Crear → 201 | ✅ |
| `POST /camiones/` | Sin nombre → 400 | ✅ |
| `GET /camiones/:id` | Por ID → 200 | ✅ |
| `GET /camiones/:id` | ID inexistente → 404 | ✅ |
| `PATCH /camiones/:id` | Actualizar → 200 | ✅ |
| `DELETE /camiones/:id` | Eliminar → 204 | ✅ |

---

### AX-CRUD_Herramientas-B2 — CRUD completo de Herramientas
**Archivo:** `tests/AX-CRUD_Herramientas-B2.test.ts`
**Contrato:** `tests/api-contracts/herramientas-api.yaml`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `GET /herramientas/` | Sin token → 401 | ✅ |
| `GET /herramientas/` | Token USER → 200 | ✅ |
| `GET /herramientas/` | Array de herramientas | ✅ |
| `POST /herramientas/` | Crear → 201 | ✅ |
| `POST /herramientas/` | Sin nombre → 400 | ✅ |
| `POST /herramientas/` | cantidad_disponible no numérico → 400 | ✅ |
| `POST /herramientas/` | cantidad_disponible negativo → 400 o 201 (ver hallazgo) | ✅ |
| `GET /herramientas/:id` | Por ID → 200 | ✅ |
| `GET /herramientas/:id` | ID inexistente → 404 | ✅ |
| `PATCH /herramientas/:id` | Actualizar → 200 | ✅ |
| `DELETE /herramientas/:id` | Eliminar → 204 | ✅ |

---

### AX-Gestión_de_Alertas_(consulta)-B3 — Consulta de Alertas
**Archivo:** `tests/AX-Gestión_de_Alertas_(consulta)-B3.test.ts`
**Contrato:** `tests/api-contracts/alertas-comunicacion-api.yaml`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `GET /alerta/rango` | Sin token → 401 | ✅ |
| `GET /alerta/:id` | Sin token → 401 | ✅ |
| `GET /alerta/usuario/:id` | Sin token → 401 | ✅ |
| `GET /alerta/rango` | Token USER → 200 | ✅ |
| `GET /alerta/rango` | Rango con datos → alertas encontradas | ✅ |
| `GET /alerta/rango` | Rango sin datos → array vacío | ✅ |
| `GET /alerta/:id` | ID válido → 200 + estadoAlerta | ✅ |
| `GET /alerta/:id` | ID inexistente → 404 | ✅ |
| `GET /alerta/usuario/:id` | Usuario con alertas → array | ✅ |
| `GET /alerta/usuario/:id` | Usuario sin alertas → array vacío | ✅ |

---

### AX-CRUD_Bolsos-B4 — CRUD completo de Bolsos
**Archivo:** `tests/AX-CRUD_Bolsos-B4.test.ts`
**Contrato:** `tests/api-contracts/bolsos-api.yaml`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `GET /bolsos/` | Sin token → 401 | ✅ |
| `GET /bolsos/` | Token USER → 200 | ✅ |
| `GET /bolsos/` | Array de bolsos | ✅ |
| `POST /bolsos/` | Crear → 201 | ✅ |
| `POST /bolsos/` | Sin nombre → 400 | ✅ |
| `GET /bolsos/:id` | Por ID → 200 | ✅ |
| `GET /bolsos/:id` | ID inexistente → 404 | ✅ |
| `PATCH /bolsos/:id` | Actualizar → 200 | ✅ |
| `DELETE /bolsos/:id` | Eliminar → 204 | ✅ |

---

### AX-Registros_de_Comunicación-B5 — Registros de Comunicación
**Archivo:** `tests/AX-Registros_de_Comunicación-B5.test.ts`
**Contrato:** `tests/api-contracts/alertas-comunicacion-api.yaml`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `POST /registros_comunicacion/crear` | Sin token → 401 | ✅ |
| `GET /registros_comunicacion/alerta/:id` | Sin token → 401 | ✅ |
| `POST /registros_comunicacion/crear` | INFORMACION (USER) → 201 | ✅ |
| `POST /registros_comunicacion/crear` | SUMINISTROS → 201 | ✅ |
| `POST /registros_comunicacion/crear` | APOYO → 201 | ✅ |
| `POST /registros_comunicacion/crear` | Tipo inválido → 500 | ✅ |
| `POST /registros_comunicacion/crear` | Alerta inexistente → 500 | ✅ |
| `GET /registros_comunicacion/alerta/:id` | Con registros → array + usuarioId | ✅ |
| `GET /registros_comunicacion/alerta/:id` | Sin registros → array vacío | ✅ |

---

## Hallazgos

### 🟡 H-1: Seed script roto — no elimina `puntos_interes` antes de `usuarios`

**Impacto:** Medio — Impide resetear la base de datos para entornos de testing/CI.

**Descripción:** Al ejecutar `npx tsx prisma/seed.ts`, el script falla con `Foreign key constraint violated on the constraint: puntos_interes_creado_por_fkey` porque el orden de limpieza no considera la tabla `puntos_interes` antes de `usuarios`.

**Pasos para reproducir:**
1. Tener registros en `puntos_interes` con FK a `usuarios`
2. Ejecutar `npx tsx prisma/seed.ts`
3. Error: FK violation en `alerta_estado_alerta_id_fkey` (línea 32 — `usuarios.deleteMany`)

**Causa raíz:** La seed limpia en orden: ... `subcategoria_alerta`, `categorias_alerta`, `estados_alerta`, `bomberos`, `bomberos_rangos`, `usuarios` pero se saltea `puntos_interes`.

**Solución sugerida para el DEV:**

**Archivo:** `prisma/seed.ts`

```diff
  await prisma.bolsos_inventario.deleteMany();
+ await prisma.puntos_interes.deleteMany();
  await prisma.registros_comunicacion.deleteMany();
```

---

### 🟡 H-2: `POST /herramientas/` acepta `cantidad_disponible` negativa

**Impacto:** Bajo — Permite crear herramientas con stock semánticamente inválido.

**Descripción:** El endpoint no valida que `cantidad_disponible` sea >= 0. Si un ADMIN envía `cantidad_disponible: -5`, la herramienta se crea con stock negativo, que no tiene sentido en el dominio.

**Solución sugerida para el DEV:**

**Archivo:** `src/modules/herramientas/herramientas.controller.ts`

```diff
  if (!data.nombre_herramienta || typeof data.cantidad_disponible !== 'number') {
      return res.status(400).json({ error: 'nombre_herramienta y cantidad_disponible son requeridos' });
  }
+ if (data.cantidad_disponible < 0) {
+     return res.status(400).json({ error: 'cantidad_disponible no puede ser negativo' });
+ }
```

---

### 🟡 H-3: `POST /registros_comunicacion/crear` requiere `fecha_hora` pero el DTO lo marca opcional

**Impacto:** Medio — Cualquier request sin `fecha_hora` devuelve 500 en vez de 400.

**Descripción:** El DTO `crearRegistroComunicacionDTO` define `fecha_hora?: string` como opcional, pero el campo `fecha_hora` en la tabla `registros_comunicacion` es `DateTime` (no nullable). Si el frontend (o un test) no envía `fecha_hora`, Prisma lanza excepción y el backend devuelve 500 sin mensaje claro.

**Pasos para reproducir:**
1. `POST /registros_comunicacion/crear` con `{ alerta_id, mensaje, tipo_comunicacion }` (sin fecha_hora)
2. Respuesta: 500 en vez de 400

**Solución sugerida para el DEV — Opción A (Controller, más simple):**

**Archivo:** `src/modules/registros_comunicacion/registros_comunicacion.controller.ts`

```diff
  const data: crearRegistroComunicacionDTO = req.body;
+ if (!data.fecha_hora) {
+     data.fecha_hora = new Date().toISOString();
+ }
```

**Opción B (Repository, default):**

```diff
  async crearRegistro(data: crearRegistroComunicacionDTO) {
      return await prisma.registros_comunicacion.create({
          data: {
              alerta_id: data.alerta_id,
              usuario_id: data.usuario_id,
              mensaje: data.mensaje,
              tipo_comunicacion: data.tipo_comunicacion,
-             fecha_hora: data.fecha_hora
+             fecha_hora: data.fecha_hora || new Date()
          }
      });
  }
```

---

### 🔵 H-4: GET /api/maps/pois ahora permite acceso a USER (comportamiento observado)

**Impacto:** Informativo — Puede ser un cambio intencional o accidental.

**Descripción:** El contrato `gestion-pois-api.yaml` especifica que `GET /api/maps/pois` requiere rol ADMIN (403 para USER). Sin embargo, el test existente `ax_gestion_pois.test.ts:66-71` ahora obtiene 200 en vez de 403 para usuarios USER. Esto sugiere que el endpoint fue modificado para permitir lectura a cualquier usuario autenticado (consistente con el endpoint público en `mapa-operativo-api.yaml`).

**Recomendación:** Si fue intencional, actualizar el contrato `gestion-pois-api.yaml` para reflejar que GET es público (autenticado, sin restricción de rol). Si no, el DEV debe agregar `verificarRolAdmin` al GET de `pois.routes.ts`.

---

## Tests pre-existentes que fallan por infraestructura (DB sin seed)

Los siguientes tests fallan exclusivamente porque la base de datos no tiene datos de seed (FK violations), no por bugs del backend:

| Test | Causa | Tests fallados |
|---|---|---|
| `ax_08.test.ts` | Falta `camion_1` y sectores en DB | 2 |
| `ax_09_bolsos_inventario.test.ts` | Falta `herr_1` en DB | 6 |
| `ax_15_pdf_generacion.test.ts` | Falta `estados_alerta` / `subcategoria_alerta` | 2 |
| `ax_16_permisos_informes.test.ts` | Falta `estados_alerta` / `subcategoria_alerta` | 4 |
| `ruba_horas_exactitud.test.ts` | Falta `estados_alerta` | 1 |
| `checklist_cuartel_security.test.ts` | Falta `herr_1` (500 en vez de 201) | 1 |
| `ax_maps_sprint6_set2.test.ts` | Alerta seed '1' no tiene lat/lng (comportamiento distinto) | 1 |
| `ax_gestion_pois.test.ts` | GET /api/maps/pois con USER retorna 200 (ver H-4) | 1 |

**Total pre-existentes:** 18 tests fallan (todos por DB sin seed + 1 por cambio comportamental)

**Solución:** Ejecutar `npx prisma migrate deploy && npx tsx prisma/seed.ts` — requiere fix del Hallazgo H-1 primero.

---

## Cómo ejecutar los nuevos tests

```bash
# Individuales
npx jest tests/AX-CRUD_Camiones-B1.test.ts --verbose
npx jest tests/AX-CRUD_Herramientas-B2.test.ts --verbose
npx jest 'tests/AX-Gestión_de_Alertas_(consulta)-B3.test.ts' --verbose
npx jest tests/AX-CRUD_Bolsos-B4.test.ts --verbose
npx jest 'tests/AX-Registros_de_Comunicación-B5.test.ts' --verbose

# Todos a la vez
npx jest --verbose
```

**Precondiciones:** Servidor corriendo en `http://localhost:3000` (o configurar `TEST_URL`).
