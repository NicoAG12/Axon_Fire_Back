# Axion Fire - Manual de API para Frontend

Este documento detalla todos los endpoints disponibles actualmente en el backend de Axion Fire. Sirve como guía de referencia rápida y manual de integración para el equipo de frontend.

## 📌 Consideraciones Generales

1. **Base URL:** El servidor se ejecuta localmente en `http://localhost:3000`.
2. **Autenticación (Middlewares):** Algunas rutas pueden estar protegidas. Por ejemplo, el endpoint de creación de usuarios (`/usuarios/crear`) hace uso del middleware `verificarHeaders`, por lo cual debes enviar el token JWT en el header `Authorization` como `Bearer <token>`.
3. **Manejo de Errores:** En caso de error, el backend generalmente devuelve un status `500` con este formato: `{ "error": "mensaje de error" }`.

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
    "rol": "BOMBERO", // Depende de la base de datos (e.g. ADMIN, BOMBERO)
    "token": "eyJhbG...",
    "msj": "Usuario Logueado Correctamente"
  }
  ```

---

## 👥 2. Usuarios (`/usuarios`)

### Crear Usuario
- **Ruta:** `POST /usuarios/crear`
- **Descripción:** Crea un nuevo usuario en el sistema. Opcionalmente, se pueden pasar los datos de "bombero" para que se cree su perfil de bombero en la misma operación.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Body request:**
  ```json
  {
    "nombre_usuario": "matias.bombero",
    "password": "suPassword123",
    "rol": "BOMBERO",
    "bombero": {  // Opcional, solo si el rol es bombero y se requiere crear el perfil
      "nombre": "Matias",
      "apellido": "Perez",
      "rango": "Capitán"
    }
  }
  ```
  Variará ligeramente según si se creó con bombero o sin bombero. Devolverá el `id`, `nombre_usuario`, `rol` y un mensaje de éxito.

### Obtener Todos los Bomberos
- **Ruta:** `GET /usuarios/bomberos`
- **Descripción:** Obtiene una lista de todos los bomberos registrados en la base de datos, incluyendo la información de usuario relacionada y el rango.
- **Headers Requeridos:** `Authorization: Bearer <token>`
- **Permisos Requeridos:** El usuario que hace la petición debe tener rol `ADMIN`.
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
- **Errores Posibles:**
  - `401 Unauthorized`: "No existe autorizacion" o "No autenticado" (falta token o no válido).
  - `403 Forbidden`: "No tiene permisos de administrador" (el rol no es ADMIN).

---

## 🚨 3. Alertas (`/alerta`)

### Crear Alerta Simple
- **Ruta:** `POST /alerta/crear`
- **Descripción:** Registra una nueva alerta en el sistema sin disparar notificaciones masivas.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Body request:**
  ```json
  {
    "sub_categoria_alerta_id": "uuid-subcategoria",
    "ubicacion": "Calle Falsa 123",
    "observaciones": "Incendio de pastizales pequeños",
    "fecha_hora": "2026-04-26T20:00:00.000Z",
    "estado_alerta_id": "uuid-estado",
    "usuario_alta_alerta": "uuid-usuario-creador"
  }
  ```

### Crear Alerta y Notificar
- **Ruta:** `POST /alerta/crear-con-notificacion`
- **Descripción:** Registra la alerta y además dispara las notificaciones a los correspondientes destinatarios (utilizando el servicio de notificaciones / Firebase).
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Body request:**
  ```json
  {
    "sub_categoria_alerta_id": "uuid-subcategoria",
    "ubicacion": "Av. Siempreviva 742",
    "observaciones": "Fuego en estructura",
    "usuario_alta_alerta": "uuid-usuario-creador",
    "destinatariosIds": ["uuid-usuario-1", "uuid-usuario-2"] // Opcional: Arreglo genérico de IDs a notificar
  }
  ```

### Obtener Alertas por Rango de Fecha
- **Ruta:** `GET /alerta/rango`
- **Descripción:** Retorna una lista de alertas filtradas por fecha.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- ⚠️ **Nota para el Front:** Actualmente este endpoint requiere enviar los parámetros en el **Body** (según el código actual del controller).
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
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Respuesta:** Devuelve un objeto con todas las propiedades de la alerta solicitada. Retorna `404` si no se encuentra.

---

## 🧑‍🚒 4. Respuestas a Alertas (`/respuestas_alertas`)

Este módulo maneja si los bomberos confirman o rechazan la asistencia al llamado (alerta).

### Obtener Respuestas por Alerta
- **Ruta:** `GET /respuestas_alertas/:id_alerta`
- **Descripción:** Retorna todas las respuestas asociadas a una alerta específica.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Parámetros en URL:**
  - `id_alerta`: UUID de la alerta.
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-respuesta",
      "alerta_id": "uuid-alerta",
      "usuario_id": "uuid-usuario",
      "estado_respuesta": "ACEPTADO",
      "fecha_hora": "2026-04-26T21:05:00.000Z",
      "usuarioId": {
        "nombre_usuario": "juan.bombero",
        "rol": "BOMBERO",
        "bombero": {
          "id": "uuid-bombero",
          "nombre": "Juan",
          "apellido": "Perez",
          "rango": "uuid-rango",
          "rangoBombero": {
            "id": "uuid-rango",
            "nombre_rol": "Capitán"
          }
        }
      }
    }
  ]
  ```
- **Errores Posibles:**
  - `500`: "No se encontro alerta"

### Responder a un Aviso
- **Ruta:** `POST /respuestas_alertas/responder/:alerta_id/:usuario_id`
- **Descripción:** Permite al bombero aceptar o rechazar una alerta. Si el estado es "ACEPTADO" y la alerta está en estado "PENDIENTE", cambia automáticamente el estado de la alerta a "EN CURSO" y crea un registro de comunicación.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Parámetros en URL:**
  - `alerta_id`: UUID de la alerta.
  - `usuario_id`: UUID del bombero respondiendo.
- **Body request:**
  ```json
  {
    "estado_respuesta": "ACEPTADO",
    "fecha_hora": "2026-04-26T21:05:00.000Z"
  }
  ```
- **Valores válidos para `estado_respuesta`:** "PENDIENTE", "ACEPTADO", "RECHAZADO"
- **Respuesta (200 OK):**
  ```json
  {
    "id": "uuid-respuesta",
    "alerta_id": "uuid-alerta",
    "usuario_id": "uuid-usuario",
    "estado_respuesta": "ACEPTADO",
    "fecha_hora": "2026-04-26T21:05:00.000Z"
  }
  ```
- **Errores Posibles:**
  - `500`: "Aviso no encontrado" - No existe una respuesta previa para esta alerta/usuario.
  - `500`: "No se puede responder una alerta ya finalizada" - La alerta está en estado "FINALIZADO".

### Eliminar Respuesta
- **Ruta:** `DELETE /respuestas_alertas/:id`
- **Descripción:** Elimina una respuesta por su ID.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Permisos Requeridos:** `ADMIN`
- **Parámetros en URL:**
  - `id`: UUID de la respuesta a eliminar.
- **Respuesta:** `204 No Content`
- **Errores Posibles:**
  - `500`: Error al eliminar.

### Contar Asistencias por Alerta
- **Ruta:** `GET /respuestas_alertas/:id_alerta/asistencias/count`
- **Descripción:** Retorna la cantidad de bomberos que han confirmado asistencia (`ACEPTADO`) a una alerta específica.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Parámetros en URL:**
  - `id_alerta`: UUID de la alerta.
- **Respuesta (200 OK):**
  ```json
  {
    "cantidad": 5
  }
  ```

---

## 📝 5. Registros de Comunicación (`/registros_comunicacion`)

Este módulo permite gestionar mensajes/solicitudes relacionados con una alerta (suministros, apoyo, información). Funciona como un historial en vivo de la comunicación durante una alerta.

### Crear Registro de Comunicación
- **Ruta:** `POST /registros_comunicacion/crear`
- **Descripción:** Crea un nuevo registro de comunicación asociado a una alerta. Puede ser una solicitud de suministros, pedido de apoyo o mensaje informativo.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Body request:**
  ```json
  {
    "alerta_id": "uuid-alerta",
    "usuario_id": "uuid-usuario",
    "mensaje": "Se necesitan 3 extintores adicionales",
    "tipo_comunicacion": "SUMINISTROS",
    "fecha_hora": "2026-04-26T22:00:00.000Z"
  }
  ```
- **Valores válidos para `tipo_comunicacion`:** `SUMINISTROS`, `APOYO`, `INFORMACION`
- **Respuesta (201 Created):**
  ```json
  {
    "id": "uuid-registro",
    "alerta_id": "uuid-alerta",
    "usuario_id": "uuid-usuario",
    "mensaje": "Se necesitan 3 extintores adicionales",
    "tipo_comunicacion": "SUMINISTROS",
    "fecha_hora": "2026-04-26T22:00:00.000Z"
  }
  ```
- **Errores Posibles:**
  - `500`: "No se encontro alerta"

### Obtener Registros por Alerta
- **Ruta:** `GET /registros_comunicacion/alerta/:id_alerta`
- **Descripción:** Retorna todos los registros de comunicación de una alerta, ordenados por fecha descendente.
- **Autorización:** `JWT Requerido` (Header `Authorization: Bearer <token>`)
- **Parámetros en URL:**
  - `id_alerta`: UUID de la alerta.
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-registro",
      "alerta_id": "uuid-alerta",
      "usuario_id": "uuid-usuario",
      "mensaje": "Se necesitan 3 extintores adicionales",
      "tipo_comunicacion": "SUMINISTROS",
      "fecha_hora": "2026-04-26T22:00:00.000Z",
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

## 🔔 6. Notificaciones PUSH (`/notificaciones`)

### Registrar Token de Dispositivo
- **Ruta:** `POST /notificaciones/registrar-token`
- **Descripción:** Guarda el token FCM (Firebase Cloud Messaging) o similar asociado al dispositivo del usuario, para poder enviarle notificaciones PUSH sobre las alertas. Idealmente se llama cada vez que el usuario hace login en la app móvil.
- **Body request:**
  ```json
  {
    "usuario_id": "uuid-del-usuario",
    "token": "token-largo-generado-por-firebase-en-el-frontend",
    "plataforma": "android" // Opcional (ej: "android", "ios", "web")
  }
  ```
