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
- **Respuesta:** Devuelve un objeto con todas las propiedades de la alerta solicitada. Retorna `404` si no se encuentra.

---

## 🧑‍🚒 4. Respuestas a Alertas (`/respuestas_alertas`)

Este módulo maneja si los bomberos confirman o rechazan la asistencia al llamado (alerta).

### Responder a un Aviso (Endpoint Principal para Front)
- **Ruta:** `POST /respuestas_alertas/responder/:alerta_id/:usuario_id`
- **Descripción:** Es la ruta que utilizará la app móvil/web del bombero para aceptar o rechazar una alerta despachada.
- **Parámetros en URL:**
  - `alerta_id`: ID de la alerta.
  - `usuario_id`: ID del bombero respondiendo.
- **Body request:**
  ```json
  {
    "estado_respuesta": "ACEPTADO", // Valores válidos: "PENDIENTE", "ACEPTADO", "RECHAZADO"
    "fecha_hora": "2026-04-26T21:05:00.000Z"
  }
  ```

*Adicionalmente, este módulo cuenta con rutas CRUD completas por si desde un panel admin se necesita visualizar, crear o modificar respuestas individualmente:*
- `GET /respuestas_alertas/`: Obtiene todas las respuestas realizadas.
- `GET /respuestas_alertas/:id`: Detalle de una respuesta por su ID.
- `POST /respuestas_alertas/`: Crea una respuesta de forma directa pasando todos los IDs (alerta, usuario) en el body.
- `PUT /respuestas_alertas/:id`: Actualiza una respuesta existente por ID.
- `DELETE /respuestas_alertas/:id`: Elimina una respuesta.

---

## 🔔 5. Notificaciones PUSH (`/notificaciones`)

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
