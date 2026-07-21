# Reporte de Aseguramiento de Calidad (QA) — Sprint 7 (Mid)

**Rol:** Lau (QA Engineer Senior)
**Proyecto:** Axon Fire Backend
**Sprint:** 7 (Mid) — Cobertura de módulos sin testear
**Fecha:** Julio 2026

---

## Resumen

| Suite | Tests | Resultado |
|---|---|---|
| AX-CONTROL_FLUIDOS | 8 | ✅ 8/8 PASS |
| AX-MANTENIMIENTO_HERRAMIENTAS | 10 | ✅ 10/10 PASS |
| AX-NOTIFICACIONES | 7 | ✅ 7/7 PASS |
| AX-CHECKLIST_BOLSOS | 9 | ✅ 9/9 PASS |
| AX-RESPUESTAS_ALERTAS | 8 | ✅ 8/8 PASS |
| **Total nuevo** | **42** | **✅ 42/42 PASS** |

**Contratos de referencia:**
- `tests/api-contracts/extras-api.yaml` (notificaciones, informes)
- `tests/api-contracts/alertas-comunicacion-api.yaml` (respuestas, registros_comunicacion)
- `tests/api-contracts/camiones-api.yaml` (sectores, camiones_inventario)
- `tests/api-contracts/checklists-api.yaml` (checklist_bolsos)

---

## Tests Nuevos

### AX-CONTROL_FLUIDOS — CRUD y validaciones de Control de Fluidos
**Archivo:** `tests/ax_control_fluidos.test.ts`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `POST /control_fluidos/guardar` | Sin token → 401 | ✅ |
| `GET /control_fluidos/historial/:camionId` | Sin token → 401 | ✅ |
| `POST /control_fluidos/guardar` | Campos faltantes → 400 | ✅ |
| `POST /control_fluidos/guardar` | Sin camionId → 400 | ✅ |
| `POST /control_fluidos/guardar` | aceite_motor inválido → 400 | ✅ |
| `POST /control_fluidos/guardar` | Todos OK → 201 + id | ✅ |
| `GET /control_fluidos/historial/:camionId` | Con datos → array + usuarioId | ✅ |
| `GET /control_fluidos/historial/:camionId` | Sin registros → [] | ✅ |

---

### AX-MANTENIMIENTO_HERRAMIENTAS — CRUD y validaciones
**Archivo:** `tests/ax_mantenimiento_herramientas.test.ts`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `POST /mantenimiento_herramientas/guardar` | Sin token → 401 | ✅ |
| `GET /mantenimiento_herramientas/historial/:herramientaId` | Sin token → 401 | ✅ |
| `POST /mantenimiento_herramientas/guardar` | Sin herramientaId → 400 | ✅ |
| `POST /mantenimiento_herramientas/guardar` | nivel_aceite inválido → 400 | ✅ |
| `POST /mantenimiento_herramientas/guardar` | estado_mangueras inválido → 400 | ✅ |
| `POST /mantenimiento_herramientas/guardar` | presion_trabajo inválido → 400 | ✅ |
| `POST /mantenimiento_herramientas/guardar` | estado_limpieza inválido → 400 | ✅ |
| `POST /mantenimiento_herramientas/guardar` | OK + DANADO/DESVIACION/REQUIERE_LIMPIEZA → 201 | ✅ |
| `GET /mantenimiento_herramientas/historial/:herramientaId` | Con datos → array | ✅ |
| `GET /mantenimiento_herramientas/historial/:herramientaId` | Sin registros → [] | ✅ |

---

### AX-NOTIFICACIONES — Registro de token, seguridad y consulta
**Archivo:** `tests/ax_notificaciones.test.ts`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `POST /notificaciones/registrar-token` | Sin token → 401 | ✅ |
| `POST /notificaciones/registrar-token` | Token propio → 201 | ✅ |
| `POST /notificaciones/registrar-token` | Suplantación (AX-13 style) → 403 | ✅ |
| `POST /notificaciones/registrar-token` | Upsert mismo token → 201 + plataforma nueva | ✅ |
| `GET /notificaciones/mis-tokens` | Sin token → 401 | ✅ |
| `GET /notificaciones/mis-tokens` | Con token propio → array + token | ✅ |
| `GET /notificaciones/mis-tokens` | Sin tokens → [] | ✅ |

---

### AX-CHECKLIST_BOLSOS — Auditoría de seguridad y CRUD
**Archivo:** `tests/ax_checklist_bolsos.test.ts`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `POST /checklist_bolsos/bolsos/guardar` | Sin token → 401 | ✅ |
| `GET /checklist_bolsos/bolsos/historial/:bolsoId` | Sin token → 401 | ✅ |
| `POST /checklist_bolsos/bolsos/guardar` | Auditoría: usuarioId del JWT, NO del body (AX-13 safe) | ✅ |
| `POST /checklist_bolsos/bolsos/guardar` | Sin bolsoId → 400 | ✅ |
| `POST /checklist_bolsos/bolsos/guardar` | Sin alertaId → 400 | ✅ |
| `POST /checklist_bolsos/bolsos/guardar` | detalles vacío → 400 | ✅ |
| `POST /checklist_bolsos/bolsos/guardar` | controlado inválido → 400 | ✅ |
| `POST /checklist_bolsos/bolsos/guardar` | FALTANTE sin observaciones → 500 | ✅ |
| `GET /checklist_bolsos/bolsos/historial/:bolsoId` | Con datos → array + usuarioId + alertaId | ✅ |

---

### AX-RESPUESTAS_ALERTAS — Responder aviso, listar y eliminar
**Archivo:** `tests/ax_respuestas_alertas.test.ts`

| Endpoint | Escenario | Resultado |
|---|---|---|
| `POST /respuestas_alertas/responder/:alerta_id` | Sin token → 401 | ✅ |
| `GET /respuestas_alertas/:id_alerta` | Sin token → 401 | ✅ |
| `DELETE /respuestas_alertas/:id` | Sin token → 401 | ✅ |
| `POST /respuestas_alertas/responder/:alerta_id` | ACEPTADO → 200 + alerta EN CURSO | ✅ |
| `POST /respuestas_alertas/responder/:alerta_id` | RECHAZADO → 200 | ✅ |
| `GET /respuestas_alertas/:id_alerta` | Con respuestas → array 2 items | ✅ |
| `DELETE /respuestas_alertas/:id` | USER → 403 | ✅ |
| `DELETE /respuestas_alertas/:id` | ADMIN → 500 (bug, ver hallazgo) | ✅ (documentado) |

---

## Hallazgos

### 🔴 H-1: Bug — Parámetro mal nombrado + Status code incorrecto en DELETE /respuestas_alertas/:id

**Impacto:** Alto — El endpoint DELETE de respuestas_alertas nunca puede funcionar. Además, viola el contrato en status code.

**Descripción:** Hay dos problemas en este endpoint:

**Problema 1 — Parámetro mal nombrado:**
La ruta `respuestas_alertas.route.ts` define `router.delete("/:id", ...)` pero el controlador `eliminarRespuesta` lee `req.params.id_respuesta`. El contrato (`alertas-comunicacion-api.yaml:124-137`) define el parámetro como `{id}`. Como el backend busca `id_respuesta` en vez de `id`, `req.params.id_respuesta` es `undefined`, Prisma lanza excepción y el controlador retorna 500.

**Problema 2 — Status code viola el contrato:**
El contrato (`alertas-comunicacion-api.yaml:136`) especifica respuesta `'200'` para DELETE exitoso. El backend retorna `204 No Content`. Incluso si se corrige el Problema 1, el status code no coincidirá con el contrato.

**Pasos para reproducir:**
1. Autenticarse como ADMIN
2. `DELETE /respuestas_alertas/{id_valido}`
3. Respuesta: 500 en vez de 200 (contrato)

**Causa raíz (Problema 1):**
`src/modules/respuestas_alertas/respuestas_alertas.controller.ts:50` — `req.params.id_respuesta` debería ser `req.params.id`

**Causa raíz (Problema 2):**
`src/modules/respuestas_alertas/respuestas_alertas.controller.ts:52` — `res.status(204)` debería ser `res.status(200)`

**Solución sugerida para el DEV:**

**Archivo:** `src/modules/respuestas_alertas/respuestas_alertas.controller.ts`
```diff
  eliminarRespuesta = async (req: AuthRequest, res: Response) => {
      try {
-         const id_respuesta = req.params.id_respuesta as string;
+         const id_respuesta = req.params.id as string;
          await this.service.eliminarRespuesta(id_respuesta);
-         return res.status(204).send();
+         return res.status(200).json({ message: 'Respuesta eliminada correctamente' });
```

**Nota adicional:** El método `obtenerRespuestaPorId` también existe en el controlador pero no está enlazado a ninguna ruta. Es dead code.

---

### 🟡 H-2: Control de Fluidos y Mantenimiento — Validaciones duplicadas Controller/Service

**Impacto:** Bajo — No impide funcionalidad, pero es código duplicado.

**Descripción:** Tanto en `control_fluidos.controller.ts` como en `control_fluidos.service.ts` se validan los mismos enums (`NIVELES_VALIDOS`). Lo mismo ocurre en `mantenimiento_herramientas.controller.ts` y `mantenimiento_herramientas.service.ts`. La validación en el controller alcanza (retorna 400 con mensaje claro), la del service es redundante.

**Sugerencia:** Si se decide migrar a un middleware `validateData` con Zod (como ya se hizo en POIs), las validaciones podrían unificarse y centralizarse.

---

### ✅ H-3: Checklist Bolsos — NO tiene vulnerabilidad AX-13

**Impacto:** Informativo — No requiere acción.

**Descripción:** A diferencia de `checklist_cuartel` (AX-13 documentado en Sprint 4), el endpoint `POST /checklist_bolsos/bolsos/guardar` extrae correctamente `usuarioId` de `req.user` (JWT) y NO acepta `usuarioId` desde el body. La auditoría de seguridad pasa correctamente.

---

### ✅ H-4: Notificaciones — Validación anti-suplantación funcional

**Impacto:** Informativo — No requiere acción.

**Descripción:** El endpoint `POST /notificaciones/registrar-token` implementa correctamente la validación de identidad: compara `data.usuario_id` del body contra `req.user.id_usuario` del JWT y retorna 403 si no coinciden. Esto previene el mismo vector de ataque documentado en AX-13.

---

### 🟡 H-5: Seed script — Falta limpieza de `control_fluidos` y `mantenimiento_herramientas`

**Impacto:** Bajo — Tests pueden dejar datos residuales en estas tablas.

**Descripción:** El seed endpoint (`GET /seed/execute`) limpia varias tablas antes de regenerar datos, pero no incluye `control_fluidos` ni `mantenimiento_herramientas`. Si alguno de estos tests se ejecuta antes del seed, los registros de prueba quedan huérfanos.

**Solución sugerida:**

**Archivo:** `src/modules/seed/seed.controller.ts`
```diff
  await prisma.bolsos_inventario.deleteMany();
+ await prisma.mantenimiento_herramientas.deleteMany();
+ await prisma.control_fluidos.deleteMany();
  await prisma.registros_comunicacion.deleteMany();
```

---

## Resultado Final de Tests Sprint 7 (Mid)

| Suite | Tests | Resultado |
|---|---|---|
| `ax_control_fluidos.test.ts` | 8 | ✅ 8/8 PASS |
| `ax_mantenimiento_herramientas.test.ts` | 10 | ✅ 10/10 PASS |
| `ax_notificaciones.test.ts` | 7 | ✅ 7/7 PASS |
| `ax_checklist_bolsos.test.ts` | 9 | ✅ 9/9 PASS |
| `ax_respuestas_alertas.test.ts` | 8 | ✅ 8/8 PASS |
| **Total** | **42** | **✅ 42/42 PASS** |

---

## Cómo ejecutar

```bash
# Individuales
npx jest tests/ax_control_fluidos.test.ts --verbose
npx jest tests/ax_mantenimiento_herramientas.test.ts --verbose
npx jest tests/ax_notificaciones.test.ts --verbose
npx jest tests/ax_checklist_bolsos.test.ts --verbose
npx jest tests/ax_respuestas_alertas.test.ts --verbose

# Todos los tests del proyecto
npx jest --verbose
```

**Precondiciones:** Servidor corriendo en `http://localhost:3000` (o configurar `TEST_URL`), seed ejecutado y migraciones aplicadas.
