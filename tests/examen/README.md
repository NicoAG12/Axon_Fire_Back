# Examen — Tests de Integración Axon Fire

## Requisitos

- Node.js 18+
- PostgreSQL corriendo con la base de datos configurada
- Seed ejecutado (`npm run db:seed`)
- Servidor Express corriendo (`npm run dev`)
- Dependencias instaladas (`npm install`)

## Cómo ejecutar los tests

Asegurate de que el servidor esté corriendo en segundo plano:

```bash
npm run dev
```

### Ejecutar TODOS los tests del examen

```bash
npx jest tests/examen/ --verbose
```

### Ejecutar un test específico

```bash
npx jest tests/examen/01-auth-login.test.ts --verbose
npx jest tests/examen/05-alertas-finalizar-admin.test.ts --verbose
```

### Variables de entorno

El test usa `TEST_URL` si está definida, o `http://localhost:3000` por defecto.

## Estructura de archivos

```
tests/examen/
├── README.md
├── 01-auth-login.test.ts
├── 02-auth-sin-token.test.ts
├── 03-auth-token-invalido.test.ts
├── 04-alertas-crear.test.ts
├── 05-alertas-finalizar-admin.test.ts
├── 06-alertas-finalizar-user-403.test.ts
├── 07-pois-user-403.test.ts
├── 08-pois-admin-crear.test.ts
├── 09-checklist-guardar.test.ts
├── 10-checklist-historial.test.ts
├── 11-metricas-user-403.test.ts
└── 12-ruba-conteo-asistencias.test.ts
```

## Qué verifica cada test

### 🔐 Autenticación (Tests 1 al 3)

| Archivo | Test | ¿Qué verifica? |
|---------|------|----------------|
| `01-auth-login.test.ts` | Login con credenciales válidas → 200 + token | Que el endpoint `/auth/login` funcione y devuelva un JWT |
| `02-auth-sin-token.test.ts` | Endpoint protegido sin token → 401 | Que el middleware rechace requests sin header Authorization |
| `03-auth-token-invalido.test.ts` | Token inválido → 401 | Que el middleware rechace tokens JWT malformados |

### 🚨 Alertas / Emergencias (Tests 4 al 6)

| Archivo | Test | ¿Qué verifica? |
|---------|------|----------------|
| `04-alertas-crear.test.ts` | Crear alerta → 200 + datos | Que cualquier usuario autenticado pueda reportar una emergencia |
| `05-alertas-finalizar-admin.test.ts` | Finalizar alerta como admin → 200 + duración | Que al finalizar se calcule la duración total de la emergencia |
| `06-alertas-finalizar-user-403.test.ts` | USER finaliza alerta → 403 | Que solo administradores puedan cerrar emergencias |

### 📍 POIs / Mapas (Tests 7 y 8)

| Archivo | Test | ¿Qué verifica? |
|---------|------|----------------|
| `07-pois-user-403.test.ts` | USER crea POI → 403 | Que solo administradores creen puntos de interés |
| `08-pois-admin-crear.test.ts` | Admin crea POI → 201 + datos | Que un administrador pueda crear un POI correctamente |

### ✅ Checklist (Tests 9 y 10)

| Archivo | Test | ¿Qué verifica? |
|---------|------|----------------|
| `09-checklist-guardar.test.ts` | Guardar checklist de camión → 201 | Que se pueda registrar un control diario de herramientas |
| `10-checklist-historial.test.ts` | Obtener historial → array | Que el historial de un camión se recupere como lista |

### 📊 Estadísticas / RUBA (Tests 11 y 12)

| Archivo | Test | ¿Qué verifica? |
|---------|------|----------------|
| `11-metricas-user-403.test.ts` | USER consulta métricas → 403 | Que solo administradores vean reportes RUBA |
| `12-ruba-conteo-asistencias.test.ts` | Conteo: solo ACEPTADO suma | Que el endpoint ignore PENDIENTE y RECHAZADO |

## Patrón usado

Todos los tests siguen **AAA (Arrange, Act, Assert)** con comentarios en español:
- **Arrange**: preparación de datos y login
- **Act**: llamada al endpoint
- **Assert**: verificación del resultado

## Datos de prueba

Los tests usan los usuarios semilla:
- `TEST_1_ADMIN` (rol ADMIN) — contraseña: `TEST_1_PASSWORD`
- `TEST_2_USER` (rol USER) — contraseña: `TEST_1_PASSWORD`

Cada test es **completamente independiente**: tiene su propio login, crea sus propios datos y los limpia al finalizar.
