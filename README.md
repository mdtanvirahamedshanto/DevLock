# DevLock

**Software Licensing, Remote Management & Developer Protection Platform**

DevLock enables developers to protect, license, and remotely manage their distributed applications through lightweight SDKs and a centralized management dashboard.

## Features

- **License Management** — Create, validate, suspend, and revoke licenses with cryptographic verification
- **Remote Kill-Switch** — Instantly disable deployed applications when needed
- **Maintenance Mode** — Show maintenance messages without redeploying
- **Domain Locking** — Prevent unauthorized redistribution by locking to specific domains
- **Feature Flags** — Toggle features in real-time across all deployments
- **Payment Warnings** — Display payment-related notices to end-users
- **In-App Notifications** — Push messages to deployed applications instantly
- **Tamper Detection** — Detect and respond to SDK manipulation attempts
- **Offline Support** — Cryptographically signed offline license tokens
- **Multi-Tenant** — Full tenant isolation with shared infrastructure efficiency

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| Real-time | Socket.IO |
| Queue | BullMQ |
| Infrastructure | Docker, Nginx |
| Monorepo | Turborepo, pnpm |

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+, Docker

# Clone and install
git clone https://github.com/your-org/devlock.git
cd devlock
pnpm install

# Start infrastructure (MongoDB, Redis)
pnpm docker:up

# Generate encryption keys
pnpm generate:keys

# Seed database
pnpm db:seed

# Start all services in development
pnpm dev
```

## Project Structure

```
devlock/
├── apps/                    # Deployable services
│   ├── dashboard/           # Next.js admin dashboard
│   ├── gateway/             # API gateway (Express)
│   ├── license-service/     # License management
│   ├── config-service/      # Remote configuration
│   ├── identity-service/    # Auth & tenant management
│   ├── websocket-gateway/   # Real-time connections
│   └── queue-worker/        # Background job processing
├── packages/                # Shared packages
│   ├── sdk-frontend/        # Browser SDK (@devlock/sdk-frontend)
│   ├── sdk-backend/         # Node.js SDK (@devlock/sdk-node)
│   ├── shared/              # Shared types & validators
│   └── db/                  # Database models
├── docker/                  # Docker & Nginx configs
└── docs/                    # Documentation
```

## SDK Usage

### Frontend SDK

```typescript
import { DevLock } from '@devlock/sdk-frontend';

const devlock = new DevLock({
  projectKey: 'pk_live_xxxxx',
  licenseKey: 'DLCK-XXXX-XXXX-XXXX-XXXX',
  callbacks: {
    onSuspended: (reason) => showBlockedUI(reason),
    onMaintenance: (msg) => showMaintenancePage(msg),
    onKillSwitch: (reason) => disableApp(reason),
    onNotification: (notif) => showToast(notif),
  }
});

await devlock.init();

if (devlock.isFeatureEnabled('premium-charts')) {
  // Show premium feature
}
```

### Backend SDK (Express)

```typescript
import { createDevLockMiddleware } from '@devlock/sdk-node/express';

app.use(createDevLockMiddleware({
  secretKey: process.env.DEVLOCK_SECRET_KEY,
  projectId: process.env.DEVLOCK_PROJECT_ID,
  excludePaths: ['/health', '/public/*'],
}));
```

## Documentation

- [Architecture Blueprint](./ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Frontend SDK Guide](./docs/SDK-FRONTEND.md)
- [Backend SDK Guide](./docs/SDK-BACKEND.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Documentation](./docs/SECURITY.md)

## License

MIT
