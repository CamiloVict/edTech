# TrofoSchool - El primer colegio sin profesores

TrofoSchool es una plataforma moderna de educación de primera infancia diseñada como un ecosistema digital que conecta a familias con proveedores de servicios educativos, ofreciendo una experiencia curada, flexible y altamente escalable.

## 🏗 Arquitectura del Monorepo

Este repositorio utiliza **Turborepo** y **pnpm workspaces** para gestionar múltiples aplicaciones y paquetes compartidos de manera eficiente.

### Estructura de Carpetas

```text
.
├── apps/
│   ├── web/        # Frontend de usuarios (Next.js, App Router)
│   ├── api/        # Backend central (NestJS, PostgreSQL, Prisma)
│   └── mobile/     # Aplicación nativa futura (React Native/Expo)
├── packages/
│   ├── database/   # Esquema Prisma y cliente de DB
│   ├── types/      # Contratos compartidos y DTOs
│   ├── eslint-config/ # Reglas de linting globales
│   └── typescript-config/ # Configuraciones base de TS
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 🛠 Stack Tecnológico

- **Frontend Web**: Next.js (App Router), React, TypeScript.
- **Frontend Mobile**: Expo (React Native), **Expo Router**, **TanStack Query**, **Zustand** (paridad de patrones con web).
- **Backend**: NestJS, TypeScript.
- **Base de Datos**: PostgreSQL, Prisma ORM.
- **Autenticación**: Clerk (JWT en API; sync del usuario interno con `POST /v1/users/sync` tras el login).
- **Herramientas de Monorepo**: Turborepo, pnpm.

## 🚀 Inicio Rápido (Desarrollo)

### Requisitos previos
- Node.js >= 18
- pnpm >= 8
- PostgreSQL en ejecución (o Docker para levantar uno listo: `docker compose up -d` en la raíz del repo)

### Instalación

1. Clona el repositorio e instala las dependencias desde la raíz:
   ```bash
   pnpm install
   ```
2. Copia variables de entorno: raíz `.env.example` → `apps/api/.env` y `apps/web/.env.local` (ver también `apps/*/.env*.example`).
3. Aplica migraciones Prisma (con PostgreSQL disponible):

   ```bash
   pnpm --filter @repo/database exec prisma migrate deploy
   ```

   En desarrollo también puedes usar `pnpm --filter @repo/database db:migrate` desde `packages/database`.

### Levantar el entorno local

```bash
pnpm dev:api    # NestJS → http://localhost:4000 (prefijo /v1)
pnpm dev:web    # Next.js → http://localhost:3000
pnpm dev:mobile # Expo
```

O todo junto: `pnpm dev` (Turbo).

### App mobile (`apps/mobile`)

- **Rutas**: carpeta `app/` (Expo Router); archivos finos que componen features.
- **Dominio / UI**: `src/features/<feature>/` con `ui/`, `hooks/`, e `index.ts` como API pública del feature (**screaming architecture**).
- **Compartido**: `src/shared/` (`ui`, `lib`, `providers`, `stores`).
- **Monorepo**: `metro.config.js` observa la raíz del workspace; `.npmrc` usa `node-linker=hoisted` para compatibilidad con Metro y pnpm.

## 🧩 Modelo de Dominio y MVP

Flujo web: **Clerk** → `/bootstrap` (`POST /v1/users/sync`) → elección de rol → onboarding → dashboard → edición de perfil.

### API (prefijo `/v1`)

| Área | Rutas principales |
|------|-------------------|
| Salud | `GET /v1/health` |
| Descubrimiento (público) | `GET /v1/discover/providers?kind=TEACHER` \| `BABYSITTER` |
| Usuario | `POST /v1/users/sync`, `GET /v1/users/me`, `GET /v1/users/bootstrap`, `POST /v1/users/role` |
| Consumidor | `GET|PATCH /v1/consumer-profiles/me`, hijos bajo `/v1/consumer-profiles/me/children`, `POST .../complete` |
| Proveedor | `GET|PATCH /v1/provider-profiles/me`, `POST .../complete` |

Autenticación: header `Authorization: Bearer <Clerk session JWT>`. El backend usa `CLERK_SECRET_KEY` y `@clerk/backend` (`verifyToken`).

### Web (`apps/web`)

- **TanStack Query** para datos de servidor; **Zustand** mínimo en `src/shared/stores`.
- Features bajo `src/features/*`, UI compartida en `src/shared/*`.
# edTech
