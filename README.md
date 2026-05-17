# Axon Fire Back

Backend con Node.js + TypeScript + PostgreSQL + Prisma ORM.

## Estructura del proyecto

```
axion_fire_back/
├── prisma/
│   ├── schema.prisma      # Definición de modelos de la DB
│   └── seed.ts            # Datos iniciales de ejemplo
├── src/
│   ├── lib/
│   │   └── prisma.ts      # Cliente Prisma (singleton)
│   ├── modules/
│   │   └── users/
│   │       └── user.repository.ts  # Ejemplo de repositorio
│   └── index.ts           # Entry point
├── .env                   # Variables de entorno (NO subir a git)
├── .gitignore
├── package.json
└── tsconfig.json
```

## Setup inicial

### 1. Configurar variables de entorno

Editá el archivo `.env` con tu configuración de PostgreSQL:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/axion_fire_db?schema=public"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear la base de datos y aplicar el schema

```bash
# Crea las tablas en la DB y genera el cliente Prisma
npm run db:migrate
```

### 4. (Opcional) Poblar la DB con datos de ejemplo

```bash
npm run db:seed
```

### 5. Correr en desarrollo

```bash
npm run dev
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con hot-reload |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm run start` | Corre la versión compilada |
| `npm run db:migrate` | Crea/aplica migraciones en desarrollo |
| `npm run db:migrate:deploy` | Aplica migraciones en producción |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:push` | Sincroniza el schema sin crear migraciones |
| `npm run db:studio` | Abre Prisma Studio (GUI para la DB) |
| `npm run db:seed` | Ejecuta el seed de datos |

---

## Flujo de trabajo con Prisma

### Agregar un nuevo modelo

1. Definí el modelo en `prisma/schema.prisma`
2. Corré `npm run db:migrate` para crear la migración
3. Creá el repositorio correspondiente en `src/modules/[modulo]/`
