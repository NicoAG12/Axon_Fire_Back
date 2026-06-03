# Reporte de Aseguramiento de Calidad (QA) y Performance - Sprint 4
**Rol:** Lau (QA Engineer Senior)
**Proyecto:** Axon Fire Backend
**Fecha:** Mayo 2026

Este documento unifica todos los hallazgos de QA, vulnerabilidades de seguridad reproducidas y los planes de mitigación listos para ser entregados al equipo de desarrollo.

---

## 1. 📌 Control de Acceso Roto - AX-13 (Seguridad)
En el endpoint de creación de Checklist del Cuartel (`POST /checklist_cuartel/`), el backend permite guardar un registro asignando la responsabilidad a cualquier usuario. Esto ocurre porque el `usuarioId` se lee del cuerpo de la petición (`req.body`) en lugar de extraerse del token de autenticación JWT.

### ⚠️ Impacto de Seguridad (Suplantación de Identidad)
* **Spoofing:** Un bombero autenticado puede suplantar a otro bombero o administrador enviando un `usuarioId` ajeno en el body.
* **Falta de No-Repudio:** Se invalida la legalidad y auditoría diaria de los checklists del cuartel.

### 🛠️ Solución Sugerida para Desarrollo
Extraer el `usuarioId` directamente del token decodificado en `req.user` (inyectado por el middleware `verificarHeaders`):
**Archivo:** `src/modules/checklist_cuartel/checklist_cuartel.controller.ts`
```diff
     crearChecklist = async (req: AuthRequest, res: Response) => {
         try {
-            const data: GuardarChecklistCuartelDTO = req.body;
-            if (!data.usuarioId) {
-                return res.status(400).json({ error: 'usuarioId es requerido' });
-            }
+            const usuarioId = (req.user as any).id_usuario;
+            if (!usuarioId) {
+                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
+            }
+            const data: Omit<GuardarChecklistCuartelDTO, 'usuarioId'> = req.body;
...
-            const resultado = await this.service.crearChecklist(data);
+            const resultado = await this.service.crearChecklist({ ...data, usuarioId });
```

---

## 2. 📌 Límites de Carga y Subida de Imágenes - AX-12 (Performance)
El frontend de la app móvil (React Native/Expo) envía fotos tomadas desde la cámara (peso estimado: 1.5MB - 5MB) en formato **Base64** dentro de peticiones JSON.

### ⚠️ Limitación Técnica Actual
* **Límite predeterminado excedido:** Express viene configurado con un límite por defecto de **100KB** para payloads JSON.
* **Fallo HTTP 413:** Cualquier subida de fotos falla inmediatamente con el código **HTTP 413 Payload Too Large**.

### 🛠️ Solución Sugerida para Desarrollo
Configurar la propiedad `limit` en el middleware `express.json()` a `10mb` para dar soporte a fotos pesadas de alta calidad de forma segura:
**Archivo:** `src/index.ts`
```diff
-app.use(express.json());
+app.use(express.json({ limit: '10mb' }));
+app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

---

## 3. 📌 Consistencia de Tiempos de Alerta - AX-14 (Error Lógico y Crash de Prisma)
Al finalizar una alerta, el backend registra la hora de regreso y calcula la duración de la respuesta de la emergencia.

### ⚠️ Los Dos Problemas Detectados por QA
1. **Error Lógico (AX-14):** No hay validación de consistencia temporal en `AlertaService.finalizarAlerta`. Si la hora de regreso es menor a la hora de llamado, el sistema registra una **duración negativa** (ej: `-18,000,000 ms`).
2. **⚠️ BUG CRÍTICO DE COMPILACIÓN EN DATABASE:** `AlertaRepositorio.actualizarEstadoAlerta` intenta actualizar el campo `duracion` y usar `estado_alerta_id` de forma directa. La última migración renombró el campo a `duracion_total_alerta` y bloquea actualizaciones directas de claves foráneas en Prisma. **Esto causará un crash del backend en producción en cuanto se finalice una alerta.**

### 🛠️ Solución Sugerida para Desarrollo
**Archivo:** `src/modules/alerta/alerta.service.ts`
```diff
         const fecha_hora_finalizacion = getLocalDate()
+        if (fecha_hora_finalizacion.getTime() < alertaActual.fecha_hora.getTime()) {
+            throw new Error("La fecha y hora de finalización no puede ser anterior a la hora de llamado.");
+        }
         const duracion = fecha_hora_finalizacion.getTime() - alertaActual.fecha_hora.getTime()
```

**Archivo:** `src/modules/alerta/alerta.repository.ts`
```diff
     async actualizarEstadoAlerta(alertaId: string, idEstadoNuevo: string, fecha_hora_finalizacion: string, duracion: number) {
         return await prisma.alerta.update({
             where: { id: alertaId },
-            data: { estado_alerta_id: idEstadoNuevo, fecha_hora_finalizacion: fecha_hora_finalizacion, duracion: duracion }
+            data: {
+                estadoAlerta: { connect: { id: idEstadoNuevo } },
+                fecha_hora_finalizacion: fecha_hora_finalizacion,
+                duracion_total_alerta: duracion
+            }
         });
     }
```

---

## 4. 📌 Conteo de Asistencia RUBA y Performance con k6 (Estadísticas)
Para generar estadísticas institucionales requeridas por el Registro Único de Bomberos de Argentina (RUBA), la API cuenta cuántos bomberos asistieron a una emergencia dada.

### 🔍 Lógica de Negocio y Exactitud
* **Regla de Negocio:** Únicamente las respuestas marcadas con el estado `'ACEPTADO'` representan asistencia efectiva en combate contra siniestros. Respuestas en estado `'RECHAZADO'` o `'PENDIENTE'` no deben contarse.
* **Validación Funcional (`tests/ruba_attendance.test.ts`):** Diseñamos e implementamos una prueba de integración que inyecta respuestas en múltiples estados y confirma que `GET /respuestas_alertas/:id_alerta/asistencias/count` devuelve un conteo 100% exacto e íntegro (filtrando correctamente).

### ⚡ Prueba de Carga y Rendimiento (k6)
Para asegurar que este endpoint estadístico soporte alta concurrencia cuando múltiples dotaciones de bomberos consultan o cierran el siniestro simultáneamente, creamos el script de k6 en:
`tests/k6_performance_ruba.js`

#### Perfil de Carga Configurado:
* **Ramp-up (Subida):** De 0 a 20 Usuarios Virtuales (VUs) en 5 segundos.
* **Sustain (Sostenido):** 20 VUs concurrentes bombardeando el endpoint por 15 segundos para medir estrés y estabilidad.
* **Ramp-down (Bajada):** Reducción segura de 20 a 0 VUs en 5 segundos.

#### Acuerdos de Nivel de Servicio (Umbrales de SLA):
* **Tolerancia de Fallos:** Tasa de error menor al **1%** (`http_req_failed: ['rate<0.01']`).
* **Baja Latencia (Percentil 95):** Menos de **200ms** de tiempo de respuesta (`http_req_duration: ['p95<200']`).
* **Picos de Carga (Percentil 99):** Menos de **400ms** de tiempo de respuesta (`http_req_duration: ['p99<400']`).

#### Cómo correr la prueba de performance:
Una vez instalado `k6` en el sistema local o contenedor Docker, ejecutar:
```bash
k6 run tests/k6_performance_ruba.js
```
