# Axion Fire Mobile

Frontend en React Native con Expo para el sistema Axion Fire.

## Requisitos

- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Backend Axion Fire ejecutándose en `http://localhost:3000`

## Instalación

```bash
cd AxionFireMobile
npm install
```

## Ejecutar

```bash
npx expo start
```

## Módulos

### Autenticación (`/auth`)
- `POST /auth/login` - Iniciar sesión

### Usuarios (`/usuarios`)
- `POST /usuarios/crear` - Crear usuario (requiere JWT)

### Alertas (`/alerta`)
- `POST /alerta/crear` - Crear alerta simple
- `POST /alerta/crear-con-notificacion` - Crear alerta y notificar
- `GET /alerta/rango` - Obtener alertas por rango de fecha
- `GET /alerta/:id` - Obtener alerta por ID

### Respuestas a Alertas (`/respuestas_alertas`)
- `POST /respuestas_alertas/responder/:alerta_id/:usuario_id` - Responder alerta
- `GET /respuestas_alertas/` - Listar todas las respuestas
- `GET /respuestas_alertas/:id` - Obtener respuesta por ID
- `POST /respuestas_alertas/` - Crear respuesta
- `PUT /respuestas_alertas/:id` - Actualizar respuesta
- `DELETE /respuestas_alertas/:id` - Eliminar respuesta

### Notificaciones (`/notificaciones`)
- `POST /notificaciones/registrar-token` - Registrar token de dispositivo

## Datos de Prueba (Seed)

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| TEST_1_ADMIN | TEST_1_PASSWORD | ADMIN |
| TEST_2_USER | TEST_1_PASSWORD | USER |
| TEST_3_USER | TEST_1_PASSWORD | USER |

## Estructura del Proyecto

```
AxionFireMobile/
├── app/                    # Pantallas (file-based routing)
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login.tsx
│   │   └── _layout.tsx
│   ├── (home)/           # Rutas principales
│   │   ├── home.tsx      # Dashboard
│   │   ├── alerts/       # Módulo de alertas
│   │   │   ├── create.tsx
│   │   │   ├── list.tsx
│   │   │   └── respond.tsx
│   │   └── users/        # Módulo de usuarios
│   │       └── create.tsx
│   └── index.tsx          # Entry point
├── src/
│   ├── api/              # Servicios de API
│   │   ├── client.ts     # Cliente Axios
│   │   ├── config.ts     # Configuración
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── alertas.ts
│   │   ├── respuestas.ts
│   │   └── notificaciones.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── storage.ts
├── app.json
├── package.json
└── tsconfig.json
```
