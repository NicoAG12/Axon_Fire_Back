# Axion Fire - Manual de API para Frontend

Este documento detalla todos los endpoints disponibles actualmente en el backend de Axion Fire. Sirve como guía de referencia rápida y manual de integración para el equipo de frontend.

## 📌 Consideraciones Generales

1. **Base URL:** El servidor se ejecuta localmente en `http://localhost:3000`.
2. **Autenticación (JWT):** Todas las rutas protegidas requieren el token JWT en el header `Authorization` como `Bearer <token>`.
3. **⚠️ EXTRACCIÓN DE USUARIO DESDE JWT:** El `usuarioId` ya NO se pasa en el body. Ahora se extrae automáticamente del token JWT en todos los endpoints que lo requieran. El frontend solo necesita enviar el token.
4. **Manejo de Errores:** En caso de error, el backend generalmente devuelve un status `500` con este formato: `{ "error": "mensaje de error" }`.

---

## 🔐 1. Autenticación (`/auth`)

### Iniciar Sesión
- **Ruta:** `POST /auth/login`
- **Descripción:** Verifica las credenciales del usuario y genera un JWT para mantener la sesión.
- **Body request:**
  ```json
  {
    "nombre_usuario": "juan123",
    "password": "passwordSegura"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "id": "uuid-del-usuario",
    "rol": "BOMBERO",
    "token": "eyJhbG...",
    "msj": "Usuario Logueado Correctamente"
  }
  ```
- **Nota:** Guardar el `token` en una variable de colección para usar en requests protegidas.

---

## 👥 2. Usuarios (`/usuarios`)

### Crear Usuario
- **Ruta:** `POST /usuarios/crear`
- **Descripción:** Crea un nuevo usuario en el sistema. Opcionalmente, se pueden pasar los datos de "bombero" para que se cree su perfil de bombero en la misma operación.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Permisos Requeridos:** `ADMIN` (requiere middleware `verificarRolAdmin`)
- **Body request:**
  ```json
  {
    "nombre_usuario": "matias.bombero",
    "password": "suPassword123",
    "rol": "BOMBERO",
    "bombero": {
      "nombre": "Matias",
      "apellido": "Perez",
      "rango": "Capitán"
    }
  }
  ```

### Obtener Todos los Bomberos
- **Ruta:** `GET /usuarios/bomberos`
- **Descripción:** Obtiene una lista de todos los bomberos registrados.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Permisos Requeridos:** `ADMIN` (requiere middleware `verificarRolAdmin`)
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Permisos Requeridos:** `ADMIN`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-del-bombero",
      "usuario_id": "uuid-del-usuario",
      "rango": "uuid-del-rango",
      "nombre": "Matias",
      "apellido": "Perez",
      "usuarioId": {
        "nombre_usuario": "matias.bombero",
        "rol": "BOMBERO"
      },
      "rangoBombero": {
        "id": "uuid-del-rango",
        "nombre_rol": "Capitán"
      }
    }
  ]
  ```

---

## 🛠️ 3. Herramientas (`/herramientas`)

Gestión del inventario maestro de herramientas/equipos disponibles en el cuartel.

### Obtener Todas las Herramientas
- **Ruta:** `GET /herramientas/`
- **Descripción:** Lista todas las herramientas disponibles con su stock.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-herramienta",
      "nombre_herramienta": "Extintor 5kg",
      "cantidad_disponible": 15
    }
  ]
  ```

### Obtener Herramienta por ID
- **Ruta:** `GET /herramientas/:id`
- **Descripción:** Obtiene una herramienta específica.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Crear Herramienta
- **Ruta:** `POST /herramientas/`
- **Descripción:** Crea una nueva herramienta en el inventario maestro.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "nombre_herramienta": "Manguera de 1.5\"",
    "cantidad_disponible": 10
  }
  ```

### Actualizar Herramienta
- **Ruta:** `PATCH /herramientas/:id`
- **Descripción:** Actualiza datos de una herramienta.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "nombre_herramienta": "Manguera de 2\"",
    "cantidad_disponible": 8
  }
  ```

### Eliminar Herramienta
- **Ruta:** `DELETE /herramientas/:id`
- **Descripción:** Elimina una herramienta del sistema.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 🚒 4. Camiones (`/camiones`)

Gestión de unidades de bomberos y sus sectores/compartimentos.

### Obtener Todos los Camiones
- **Ruta:** `GET /camiones/`
- **Descripción:** Lista todos los camiones registrados.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-camion",
      "nombre_camion": "Unidad 1",
      "estado": "ACTIVO",
      "sectores": []
    }
  ]
  ```

### Obtener Solo Camiones Activos
- **Ruta:** `GET /camiones/activos`
- **Descripción:** Lista solo los camiones con estado ACTIVO.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Obtener Camión por ID
- **Ruta:** `GET /camiones/:id`
- **Descripción:** Obtiene detalles de un camión específico.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Crear Camión
- **Ruta:** `POST /camiones/`
- **Descripción:** Crea un nuevo camión.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "nombre_camion": "Unidad de Rescate",
    "estado": "ACTIVO"
  }
  ```

### Actualizar Camión
- **Ruta:** `PATCH /camiones/:id`
- **Descripción:** Actualiza datos de un camión.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "nombre_camion": "Unidad de Rescate 2",
    "estado": "INACTIVO"
  }
  ```

### Eliminar Camión
- **Ruta:** `DELETE /camiones/:id`
- **Descripción:** Elimina un camión del sistema.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 📦 5. Sectores de Camión (`/sectores`)

Los sectores representan los compartimentos/zonas dentro de un camión donde se almacenan las herramientas.

### Crear Sector
- **Ruta:** `POST /sectores/`
- **Descripción:** Crea un nuevo sector/compartimento para un camión.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "camionId": "uuid-camion",
    "nombre_sector": "Compartimento Lateral Izquierdo 1"
  }
  ```

### Obtener Sectores por Camión
- **Ruta:** `GET /sectores/camion/:camionId`
- **Descripción:** Lista todos los sectores de un camión específico.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Eliminar Sector
- **Ruta:** `DELETE /sectores/:id`
- **Descripción:** Elimina un sector. Si el sector tiene inventario asociado, se elimina en cascada.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 📋 6. Inventario de Camiones (`/camiones_inventario`)

Gestión del inventario de herramientas asignadas a cada camión. Cuando se agrega una herramienta, automáticamente decrementa el stock en `herramientas.cantidad_disponible`. Al eliminar, restaura el stock.

### Agregar Herramienta a Inventario
- **Ruta:** `POST /camiones_inventario/`
- **Descripción:** Asigna una herramienta del stock maestro a un camión en un sector específico. Decrementa `cantidad_disponible` en herramientas.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "camionId": "uuid-camion",
    "herramientaId": "uuid-herramienta",
    "sectorId": "uuid-sector",
    "cantidad": 2
  }
  ```
- **Validación:** Si no hay suficiente stock disponible, retorna error.

### Obtener Inventario por Camión
- **Ruta:** `GET /camiones_inventario/camion/:camionId`
- **Descripción:** Lista todas las herramientas asignadas a un camión con su sector y cantidad.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-inventario",
      "camion_id": "uuid-camion",
      "sector_id": "uuid-sector",
      "herramienta_id": "uuid-herramienta",
      "cantidad_herramienta": 2,
      "sectorId": {
        "id": "uuid-sector",
        "nombre_sector": "Compartimento Lateral 1"
      },
      "herramientaId": {
        "id": "uuid-herramienta",
        "nombre_herramienta": "Extintor 5kg"
      }
    }
  ]
  ```

### Obtener Inventario Agrupado por Sector
- **Ruta:** `GET /camiones_inventario/camion/:camionId/agrupado`
- **Descripción:** Lista el inventario agrupado por nombre de sector.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "nombre_sector": "Compartimento Lateral 1",
      "herramientas": [
        {
          "id": "uuid-inventario",
          "herramienta": "Extintor 5kg",
          "cantidad_herramienta": 2
        }
      ]
    }
  ]
  ```

### Actualizar Cantidad de Inventario
- **Ruta:** `PATCH /camiones_inventario/:id`
- **Descripción:** Actualiza la cantidad de una herramienta en el inventario del camión.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "cantidad": 5
  }
  ```

### Eliminar del Inventario
- **Ruta:** `DELETE /camiones_inventario/:id`
- **Descripción:** Elimina una herramienta del inventario del camión. **Restaura el stock** en `herramientas.cantidad_disponible`.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 🎒 7. Bolsas de Emergencia (`/bolsos`)

Gestión de bolsos/bolsones de emergencia que contain herramientas para intervenciones rápidas.

### Obtener Todos los Bolsos
- **Ruta:** `GET /bolsos/`
- **Descripción:** Lista todos los bolsos de emergencia.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Obtener Bolso por ID
- **Ruta:** `GET /bolsos/:id`
- **Descripción:** Obtiene detalles de un bolso específico.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Crear Bolso
- **Ruta:** `POST /bolsos/`
- **Descripción:** Crea un nuevo bolso de emergencia.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "nombre_bolso": "Kit de Rescate",
    "estado": "ACTIVO"
  }
  ```

### Actualizar Bolso
- **Ruta:** `PATCH /bolsos/:id`
- **Descripción:** Actualiza datos de un bolso.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Eliminar Bolso
- **Ruta:** `DELETE /bolsos/:id`
- **Descripción:** Elimina un bolso del sistema.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 🎒 8. Inventario de Bolsas (`/bolsos_inventario`)

Gestión del inventario de herramientas asignadas a cada bolso de emergencia. Similar a camiones_inventario pero sin restauración de stock al eliminar.

### Agregar Herramienta a Inventario de Bolso
- **Ruta:** `POST /bolsos_inventario/`
- **Descripción:** Asigna una herramienta del stock maestro a un bolso. Decrementa `cantidad_disponible`.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "bolsoId": "uuid-bolso",
    "herramientaId": "uuid-herramienta",
    "cantidad": 1
  }
  ```

### Obtener Inventario por Bolso
- **Ruta:** `GET /bolsos_inventario/bolso/:bolsoId`
- **Descripción:** Lista todas las herramientas asignadas a un bolso.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Actualizar Cantidad de Inventario de Bolso
- **Ruta:** `PATCH /bolsos_inventario/:id`
- **Descripción:** Actualiza la cantidad de una herramienta en el inventario del bolso.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Eliminar del Inventario de Bolso
- **Ruta:** `DELETE /bolsos_inventario/:id`
- **Descripción:** Elimina una herramienta del inventario del bolso. **NO restaura stock** (se considera consumido).
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## ✅ 9. Checklist de Camiones (`/checklist`)

Registros del control diario de herramientas en cada camión. Valida que todas las herramientas estén presentes o registra faltantes.

### Guardar Checklist Diario
- **Ruta:** `POST /checklist/guardar`
- **Descripción:** Registra el checklist de control diario de un camión. El `usuarioId` se obtiene del JWT.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "camionId": "uuid-camion",
    "detalles": [
      {
        "inventarioId": "uuid-inventario",
        "controlado": "CHEQUEADO"
      },
      {
        "inventarioId": "uuid-inventario-2",
        "controlado": "FALTANTE",
        "observaciones": "Extintor defectuoso"
      }
    ]
  }
  ```
- **Valores para `controlado`:** `CHEQUEADO` | `FALTANTE`
- **Validación:** Si `controlado` es `FALTANTE`, `observaciones` es obligatorio.

### Obtener Historial de Checklist por Camión
- **Ruta:** `GET /checklist/historial/:camionId`
- **Descripción:** Obtiene el historial completo de checklists de un camión, ordenados por fecha descendente.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-checklist",
      "fecha_control": "2026-04-26T08:00:00.000Z",
      "camion_id": "uuid-camion",
      "usuario_id": "uuid-usuario",
      "detalles": [
        {
          "id": "uuid-detalle",
          "inventarioId": {
            "herramientaId": {
              "nombre_herramienta": "Extintor 5kg"
            }
          },
          "controlado": "CHEQUEADO",
          "observaciones": null
        }
      ],
      "usuarioId": {
        "nombre_usuario": "juan.bombero",
        "bombero": {
          "nombre": "Juan",
          "apellido": "Perez"
        }
      }
    }
  ]
  ```

---

## ✅ 10. Checklist de Bolsas (`/checklist_bolsos`)

Registros del control de herramientas en bolsos de emergencia, generalmente después de una intervención.

### Guardar Checklist de Bolso
- **Ruta:** `POST /checklist_bolsos/bolsos/guardar`
- **Descripción:** Registra el checklist de un bolso de emergencia. El `usuarioId` se obtiene del JWT.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "bolsoId": "uuid-bolso",
    "detalles": [
      {
        "inventarioId": "uuid-inventario-bolso",
        "controlado": "CHEQUEADO"
      },
      {
        "inventarioId": "uuid-inventario-bolso-2",
        "controlado": "FALTANTE",
        "observaciones": "Tijeras rotas"
      }
    ]
  }
  ```

### Obtener Historial de Checklist por Bolso
- **Ruta:** `GET /checklist_bolsos/bolsos/historial/:bolsoId`
- **Descripción:** Obtiene el historial de checklists de un bolso, filtrando solo items marcados como `FALTANTE`.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## ✅ 11. Checklist de Cuartel (`/checklist_cuartel`)

Registros del control semanal de herramientas del cuartel. Controla directamente las herramientas del inventario maestro.

### Guardar Checklist de Cuartel
- **Ruta:** `POST /checklist_cuartel/`
- **Descripción:** Registra el checklist semanal de herramientas del cuartel. El `usuarioId` se pasa en el body.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "usuarioId": "uuid-usuario",
    "detalles": [
      {
        "herramientaId": "uuid-herramienta",
        "controlado": "CHEQUEADO"
      },
      {
        "herramientaId": "uuid-herramienta-2",
        "controlado": "FALTANTE",
        "observaciones": "Extintor necesita recarga"
      }
    ]
  }
  ```
- **Valores para `controlado`:** `CHEQUEADO` | `FALTANTE`
- **Validación:** Si `controlado` es `FALTANTE`, `observaciones` es obligatorio.

### Obtener Historial de Checklists
- **Ruta:** `GET /checklist_cuartel/`
- **Descripción:** Obtiene el historial completo de checklists del cuartel, ordenados por fecha descendente.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-checklist",
      "fecha_control": "2026-05-17T08:00:00.000Z",
      "usuario_id": "uuid-usuario",
      "usuario": {
        "id": "uuid-usuario",
        "nombre_usuario": "juan.bombero",
        "bombero": {
          "nombre": "Juan",
          "apellido": "Perez"
        }
      },
      "detalles": [
        {
          "id": "uuid-detalle",
          "herramienta_id": "uuid-herramienta",
          "controlado": "CHEQUEADO",
          "observaciones": null,
          "herramienta": {
            "id": "uuid-herramienta",
            "nombre_herramienta": "Extintor 5kg",
            "cantidad_disponible": 15
          }
        }
      ]
    }
  ]
  ```

### Obtener Detalle de Checklist
- **Ruta:** `GET /checklist_cuartel/:id`
- **Descripción:** Obtiene el detalle de un checklist específico incluyendo la información completa de cada herramienta controlada.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta (200 OK):**
  ```json
  {
    "id": "uuid-checklist",
    "fecha_control": "2026-05-17T08:00:00.000Z",
    "usuario_id": "uuid-usuario",
    "usuario": {
      "id": "uuid-usuario",
      "nombre_usuario": "juan.bombero",
      "bombero": {
        "nombre": "Juan",
        "apellido": "Perez"
      }
    },
    "detalles": [
      {
        "id": "uuid-detalle",
        "herramienta_id": "uuid-herramienta",
        "controlado": "FALTANTE",
        "observaciones": "Extintor necesita recarga",
        "herramienta": {
          "id": "uuid-herramienta",
          "nombre_herramienta": "Extintor 5kg",
          "cantidad_disponible": 15
        }
      }
    ]
  }
  ```
- **Respuesta de error (404):** `{ "error": "Checklist no encontrado" }`

### Enviar Recordatorio de Checklist
- **Ruta:** `POST /checklist_cuartel/recordatorio`
- **Descripción:** Envía una notificación push a todos los bomberos recordando que completen el checklist semanal del cuartel. Permite enviar un recordatorio dirigido a usuarios específicos si se proveen sus IDs.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request (Opcional):**
  ```json
  {
    "usuariosIds": ["uuid-usuario-1", "uuid-usuario-2"]
  }
  ```
- **Nota:** Si el array `usuariosIds` no se envía o está vacío, el sistema notificará automáticamente a todos los bomberos.

---

## 🚨 12. Alertas (`/alerta`)

### Crear Alerta Simple
- **Ruta:** `POST /alerta/crear`
- **Descripción:** Registra una nueva alerta sin disparar notificaciones.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "sub_categoria_alerta_id": "uuid-subcategoria",
    "ubicacion": "Calle Falsa 123",
    "observaciones": "Incendio de pastizales pequeños",
    "fecha_hora": "2026-04-26T20:00:00.000Z",
    "estado_alerta_id": "uuid-estado"
  }
  ```

### Crear Alerta y Notificar
- **Ruta:** `POST /alerta/crear-con-notificacion`
- **Descripción:** Registra la alerta y envía notificaciones push a los destinatarios.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "sub_categoria_alerta_id": "uuid-subcategoria",
    "ubicacion": "Av. Siempreviva 742",
    "observaciones": "Fuego en estructura",
    "destinatariosIds": ["uuid-usuario-1", "uuid-usuario-2"]
  }
  ```

### Obtener Alertas por Rango de Fecha
- **Ruta:** `GET /alerta/rango`
- **Descripción:** Retorna alertas filtradas por rango de fecha.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "fecha_desde": "2026-04-01T00:00:00.000Z",
    "fecha_hasta": "2026-04-30T23:59:59.000Z"
  }
  ```

### Obtener Alerta por ID
- **Ruta:** `GET /alerta/:id_alerta`
- **Descripción:** Detalles de una alerta específica.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 🧑‍🚒 12. Respuestas a Alertas (`/respuestas_alertas`)

### Obtener Respuestas por Alerta
- **Ruta:** `GET /respuestas_alertas/:id_alerta`
- **Descripción:** Retorna todas las respuestas asociadas a una alerta.
- **Headers Requeridos:** `Authorization: Bearer <token>`

### Responder a un Aviso
- **Ruta:** `POST /respuestas_alertas/responder/:alerta_id`
- **Descripción:** Permite al bombero aceptar o rechazar una alerta. El `usuarioId` se obtiene del JWT.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "estado_respuesta": "ACEPTADO",
    "fecha_hora": "2026-04-26T21:05:00.000Z"
  }
  ```
- **Valores válidos:** `PENDIENTE` | `ACEPTADO` | `RECHAZADO`
- **Lógica:** Si `ACEPTADO` y alerta está `PENDIENTE`, cambia estado a `EN CURSO`.

### Eliminar Respuesta
- **Ruta:** `DELETE /respuestas_alertas/:id`
- **Descripción:** Elimina una respuesta.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Permisos Requeridos:** `ADMIN` (requiere middleware `verificarRolAdmin`)

### Contar Asistencias por Alerta
- **Ruta:** `GET /respuestas_alertas/:id_alerta/asistencias/count`
- **Descripción:** Retorna la cantidad de bomberos que confirmaron asistencia (`ACEPTADO`).
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Respuesta:**
  ```json
  {
    "cantidad": 5
  }
  ```

---

## 📝 13. Registros de Comunicación (`/registros_comunicacion`)

### Crear Registro de Comunicación
- **Ruta:** `POST /registros_comunicacion/crear`
- **Descripción:** Crea un registro asociado a una alerta. El `usuarioId` se obtiene del JWT.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "alerta_id": "uuid-alerta",
    "mensaje": "Se necesitan 3 extintores adicionales",
    "tipo_comunicacion": "SUMINISTROS",
    "fecha_hora": "2026-04-26T22:00:00.000Z"
  }
  ```
- **Valores válidos:** `SUMINISTROS` | `APOYO` | `INFORMACION`

### Obtener Registros por Alerta
- **Ruta:** `GET /registros_comunicacion/alerta/:id_alerta`
- **Descripción:** Obtiene todos los registros de una alerta, ordenados por fecha.
- **Headers Requeridos:** `Authorization: Bearer <token>`

---

## 🔔 14. Notificaciones Push (`/notificaciones`)

### Registrar Token de Dispositivo
- **Ruta:** `POST /notificaciones/registrar-token`
- **Descripción:** Registra el token FCM para notificaciones push.
- **Body request:**
  ```json
  {
    "usuario_id": "uuid-del-usuario",
    "token": "token-firebase-dispositivo",
    "plataforma": "android"
  }
  ```

---

## 🔄 Flujos de Trabajo - Paso a Paso

### Workflow A: Configurar Camión Listo para Servicio

**Objetivo:** Dejar un camión completamente equipado con herramientas en sus sectores.

1. **Crear herramienta(s) en stock maestro**
   - `POST /herramientas/` (ej: crear 20 extintores)

2. **Crear camión**
   - `POST /camiones/` (ej: "Unidad 1")

3. **Crear sectores en el camión**
   - `POST /sectores/` (ej: "Compartimento Lateral 1", "Compartimento Trasero")

4. **Obtener IDs** necesarios para el inventario:
   - `GET /herramientas/` → copiar `id` de cada herramienta
   - `GET /camiones/` → copiar `id` del camión creado
   - `GET /sectores/camion/:camionId` → copiar `id` de cada sector

5. **Asignar herramientas a sectores del camión**
   - `POST /camiones_inventario/` (repetir por cada herramienta/sector)
   - Body: `{ camionId, herramientaId, sectorId, cantidad }`

6. **Verificar inventario agrupado**
   - `GET /camiones_inventario/camion/:camionId/agrupado`

---

### Workflow B: Checklist Diario de Camión

**Objetivo:** Realizar el control matutino de herramientas en un camión.

1. **Obtener inventario del camión**
   - `GET /camiones_inventario/camion/:camionId`
   - Copiar `id` de cada item en `camiones_inventario`

2. **Registrar checklist**
   - `POST /checklist/guardar`
   - Body con `camionId` y array de `detalles`
   - Para cada item: marcar `CHEQUEADO` o `FALTANTE`
   - Si `FALTANTE`, agregar `observaciones`

---

### Workflow C: Gestionar Bolsa de Emergencia

**Objetivo:** Preparar un bolso de emergencia con herramientas para intervención rápida.

1. **Crear bolso**
   - `POST /bolsos/` (ej: "Kit de Rescate")

2. **Agregar herramientas al bolso**
   - `POST /bolsos_inventario/` (repetir por cada herramienta)
   - Body: `{ bolsoId, herramientaId, cantidad }`

3. **Verificar contenido**
   - `GET /bolsos_inventario/bolso/:bolsoId`

4. **Después de intervención, registrar checklist**
   - `POST /checklist_bolsos/bolsos/guardar`
   - Marcar items como `CHEQUEADO` o `FALTANTE`

---

### Workflow D: Ciclo Completo de Alerta

**Objetivo:** Crear una alerta, notificar bomberos, registrar asistencia y comunicación.

1. **Login (obtener token)**
   - `POST /auth/login`
   - **Guardar token** en variable `{{token}}`

2. **Crear alerta con notificación**
   - `POST /alerta/crear-con-notificacion`
   - **Guardar `id` de alerta** para siguientes pasos

3. **Bomberos responden a la alerta**
   - `POST /respuestas_alertas/responder/:alerta_id`
   - Body: `{ estado_respuesta: "ACEPTADO", fecha_hora: "..." }`

4. **Verificar asistencia**
   - `GET /respuestas_alertas/:alerta_id/asistencias/count`

5. **Registrar comunicación durante la alerta**
   - `POST /registros_comunicacion/crear`
   - Body: `{ alerta_id, mensaje, tipo_comunicacion }`

6. **Ver historial de comunicación**
   - `GET /registros_comunicacion/alerta/:id_alerta`

---

### Workflow E: Reponer Stock Después de Intervención

**Objetivo:** Después de usar herramientas, reponer el stock maestro.

1. **Identificar herramientas usadas**
   - Revisar checklist donde se marcaron `FALTANTE`

2. **Actualizar stock maestro**
   - `PATCH /herramientas/:id`
   - Body: `{ cantidad_disponible: nueva_cantidad }`

3. **Reasignar herramientas a camión/bolso**
   - `POST /camiones_inventario/` o `POST /bolsos_inventario/`

---

## 📊 Estados y Enums Comunes

### Estado de Camión
- `ACTIVO` - Disponible para servicio
- `INACTIVO` - En mantenimiento o fuera de servicio

### Estado de Control de Herramienta
- `CHEQUEADO` - Herramienta presente y en condiciones
- `FALTANTE` - Herramienta no encontrada o defectuosa

### Tipo de Comunicación
- `SUMINISTROS` - Solicitud de materiales
- `APOYO` - Solicitud de refuerzos
- `INFORMACION` - Mensaje informativo

### Estado de Respuesta
- `PENDIENTE` - Aún no respondió
- `ACEPTADO` - Confirmó asistencia
- `RECHAZADO` - No puede asistir

---

## 🔗 Relaciones entre Entidades

```
HERRAMIENTAS (Stock Maestro)
    ├── cantidad_disponible (stock global)
    │
    ├──-> CAMIONES_INVENTARIO (asignado a camión)
    │         ├──-> SECTOR -> CAMION
    │         └──-> CHECKLIST_DETALLE (controlado en checklist)
    │
    └──-> BOLSOS_INVENTARIO (asignado a bolso)
              ├──-> BOLSO
              └──-> CHECKLIST_DETALLE_BOLSOS (controlado en checklist)

CAMION
    ├──-> SECTORES (compartimentos)
    ├──-> CHECKLIST_CAMIONES_DIARIO (control diario)
    └──-> CHECKLIST_DETALLE (items controlados)

BOLSO
    ├──-> BOLSOS_INVENTARIO (herramientas)
    ├──-> CHECKLIST_BOLSOS_EMERGENCIA (control post-intervención)
    └──-> CHECKLIST_DETALLE_BOLSOS (items controlados)
```