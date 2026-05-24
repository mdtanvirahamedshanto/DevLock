# DevLock

**Production-Grade Turborepo Monorepo — Software Licensing & Remote Management Platform**

## Architecture Overview

```
devlock/
├── apps/                          # Deployable applications
│   ├── web-dashboard/             # Next.js admin dashboard
│   ├── api-gateway/               # Express.js API gateway
│   ├── auth-service/              # Authentication & identity
│   ├── license-service/           # License CRUD & validation
│   ├── telemetry-service/         # Analytics & audit logging
│   ├── websocket-service/         # Real-time Socket.IO gateway
│   ├── notification-service/      # Email, webhooks, push
│   └── billing-service/           # Stripe subscription management
├── packages/                      # Shared internal packages
│   ├── frontend-sdk/              # Browser SDK (@devlock/frontend-sdk)
│   ├── backend-sdk/               # Node.js SDK (@devlock/backend-sdk)
│   ├── shared-types/              # TypeScript types & Zod validators
│   ├── ui/                        # React component library
│   ├── database/                  # Mongoose models & connections
│   ├── logger/                    # Structured logging (pino)
│   ├── config/                    # Environment config with validation
│   ├── encryption/                # Crypto utilities (AES, Ed25519, HMAC)
│   ├── eslint-config/             # Shared ESLint configurations
│   └── tsconfig/                  # Shared TypeScript configurations
├── docker/                        # Docker Compose & infrastructure
├── scripts/                       # Utility scripts
└── .github/workflows/             # CI/CD pipelines
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript (strict mode) |
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Express.js, Node.js 20 |
| Database | MongoDB 7 (Mongoose) |
| Cache | Redis 7 (ioredis) |
| Real-time | Socket.IO 4 |
| Queue | BullMQ |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Linting | ESLint, Prettier |
| Git Hooks | Husky, lint-staged, Commitlint |

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+, Docker

# 1. Install dependencies
pnpm install

# 2. Copy environment config
cp .env.example .env

# 3. Generate cryptographic keys
pnpm generate:keys
# Copy output into .env

# 4. Start infrastructure
pnpm docker:up

# 5. Start all services in dev mode
pnpm dev

# Or start specific services:
pnpm dev:web    # Dashboard only
pnpm dev:api    # API + dependencies
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Package names | `@devlock/<name>` | `@devlock/shared-types` |
| App names | `@devlock/<name>` | `@devlock/api-gateway` |
| Files | `kebab-case` | `rate-limiter.ts` |
| Directories | `kebab-case` | `shared-types/` |
| Types/Interfaces | `PascalCase` | `TenantContext` |
| Functions | `camelCase` | `createLogger()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_POOL_SIZE` |
| Env variables | `UPPER_SNAKE_CASE` | `MONGODB_URI` |
| DB collections | `snake_case` (plural) | `audit_logs` |
| API routes | `kebab-case` | `/v1/feature-flags` |
| Commit scopes | `kebab-case` | `feat(license-service):` |

## Dependency Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPS (Deployable)                          │
├─────────────────────────────────────────────────────────────────┤
│  web-dashboard ──► ui, shared-types                              │
│  api-gateway ────► database, logger, config, encryption,         │
│                    shared-types                                   │
│  auth-service ───► database, logger, config, encryption,         │
│                    shared-types                                   │
│  license-service ► database, logger, config, encryption,         │
│                    shared-types                                   │
│  (all services follow same pattern)                              │
├─────────────────────────────────────────────────────────────────┤
│                      PACKAGES (Shared)                            │
├─────────────────────────────────────────────────────────────────┤
│  frontend-sdk ───► shared-types                                  │
│  backend-sdk ────► shared-types                                  │
│  database ───────► shared-types, logger                          │
│  ui ─────────────► (standalone, React peer dep)                  │
│  logger ─────────► (standalone)                                  │
│  config ─────────► (standalone)                                  │
│  encryption ─────► (standalone)                                  │
│  shared-types ───► (standalone, foundation layer)                │
│  eslint-config ──► (standalone, dev tooling)                     │
│  tsconfig ───────► (standalone, dev tooling)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Internal Package Imports

All internal packages use `workspace:*` protocol:

```json
{
  "dependencies": {
    "@devlock/shared-types": "workspace:*",
    "@devlock/logger": "workspace:*",
    "@devlock/database": "workspace:*"
  }
}
```

Import in code:
```typescript
import { LicenseStatus, type License } from '@devlock/shared-types';
import { createLogger } from '@devlock/logger';
import { LicenseModel, connectMongo } from '@devlock/database';
import { encrypt, generateLicenseKey } from '@devlock/encryption';
```

## Environment Strategy

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.example` | Template with all variables | ✅ Yes |
| `.env` | Local development defaults | ❌ No |
| `.env.local` | Personal overrides | ❌ No |
| `.env.test` | Test environment | ✅ Yes |
| Docker env | Per-service in compose | ❌ No |
| CI env | GitHub Actions secrets | N/A |

Config is validated at startup via Zod schemas in `@devlock/config`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in dev mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run all tests |
| `pnpm format` | Format all files with Prettier |
| `pnpm clean` | Remove all build artifacts |
| `pnpm docker:up` | Start MongoDB + Redis |
| `pnpm docker:down` | Stop infrastructure |
| `pnpm generate:keys` | Generate crypto keys |

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by Commitlint:

```
<type>(<scope>): <subject>

feat(license-service): add offline token generation
fix(frontend-sdk): handle WebSocket reconnection
docs(root): update architecture diagram
```

## Docker Strategy

- **Development**: `docker-compose.yml` runs only infrastructure (MongoDB, Redis)
- **Production**: Each app has its own multi-stage Dockerfile
- **Images**: Distroless Node.js Alpine, non-root user, health checks
- **Build**: Multi-stage with dependency caching for fast rebuilds

## License

MIT
