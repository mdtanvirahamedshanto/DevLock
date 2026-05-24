# Contributing to DevLock

Thank you for your interest in contributing to DevLock! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold a welcoming, inclusive environment.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Docker & Docker Compose
- Git

### Local Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/DevLock.git
cd DevLock

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
pnpm generate:keys
# Copy the generated values into .env

# 4. Start infrastructure
pnpm docker:up

# 5. Verify everything works
pnpm build
pnpm lint
pnpm typecheck
```

### Running in Development

```bash
# All services
pnpm dev

# Specific service
pnpm dev --filter=@devlock/api-gateway

# Dashboard only (with dependencies)
pnpm dev:web
```

---

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   # or: fix/bug-description, docs/what-changed, refactor/area
   ```

2. **Make your changes** — write code, add tests

3. **Run checks locally**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

4. **Commit** using conventional commits (enforced by hooks):
   ```bash
   git commit -m "feat(license-service): add batch license creation"
   ```

5. **Push and open a PR** against `main`

---

## Project Structure

```
apps/           → Deployable services (each is independent)
packages/       → Shared internal libraries
docker/         → Docker Compose and infrastructure
scripts/        → Utility scripts
docs/           → Documentation
.github/        → CI/CD and issue templates
```

### Key Principles

- **Packages are the foundation** — shared logic lives in `packages/`, apps consume them
- **Each app is independently deployable** — its own Dockerfile, health check, config
- **Types flow from `shared-types`** — single source of truth for interfaces
- **No circular dependencies** — packages never import from apps

### Adding a New Package

```bash
mkdir -p packages/my-package/src
```

Create `packages/my-package/package.json`:
```json
{
  "name": "@devlock/my-package",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc --project tsconfig.build.json",
    "clean": "rm -rf dist .turbo",
    "lint": "eslint src/ --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@devlock/eslint-config": "workspace:*",
    "@devlock/tsconfig": "workspace:*",
    "eslint": "^8.57.0",
    "typescript": "^5.5.0"
  }
}
```

### Adding a New Service

Follow the pattern in any existing `apps/*` service. Each service needs:
- `package.json` with `@devlock/*` workspace dependencies
- `tsconfig.build.json` extending `@devlock/tsconfig/node.json`
- `src/index.ts` entry point with health check endpoint
- `Dockerfile` (multi-stage, non-root user)

---

## Coding Standards

### TypeScript

- Strict mode enabled everywhere
- Use `type` imports: `import type { Foo } from './foo.js'`
- No `any` — use `unknown` and narrow with type guards
- All public functions must have JSDoc comments
- File extensions in imports (`.js` for Node ESM)

### Naming

| Item | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `rate-limiter.ts` |
| Types/Interfaces | PascalCase | `LicenseValidation` |
| Functions/Variables | camelCase | `createLogger` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Enums | PascalCase (members UPPER_SNAKE) | `LicenseStatus.ACTIVE` |

### File Organization (per service)

```
src/
├── index.ts            → Entry point, server bootstrap
├── routes/             → Express route handlers
├── controllers/        → Request/response logic
├── services/           → Business logic
├── middleware/         → Express middleware
├── validators/         → Zod schemas for this service
└── utils/              → Service-specific helpers
```

### Testing

- Use Vitest for all tests
- Test files: `*.test.ts` or `*.spec.ts` next to source
- Aim for meaningful coverage, not 100% line coverage
- Integration tests use real MongoDB/Redis (via Docker in CI)

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/). This is enforced by Commitlint via Husky.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring, no behavior change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |
| `revert` | Reverting a previous commit |

### Scopes

Use the package/app name: `web-dashboard`, `api-gateway`, `license-service`, `auth-service`, `telemetry-service`, `websocket-service`, `notification-service`, `billing-service`, `frontend-sdk`, `backend-sdk`, `shared-types`, `ui`, `logger`, `encryption`, `database`, `config`, `docker`, `ci`, `root`

### Examples

```
feat(license-service): add offline token generation
fix(frontend-sdk): handle WebSocket reconnection on mobile
docs(root): add deployment guide
refactor(database): extract connection retry logic
test(encryption): add Ed25519 signing edge cases
ci(root): add Docker build caching
```

---

## Pull Request Process

1. **Fill out the PR template** — describe what changed and why
2. **Ensure CI passes** — lint, typecheck, tests, build
3. **Keep PRs focused** — one feature or fix per PR
4. **Update docs** if your change affects public APIs or setup
5. **Add tests** for new features and bug fixes
6. **Request review** — maintainers will review within 48 hours

### PR Title Format

Same as commit convention:
```
feat(scope): short description
```

### What We Look For

- Clean, readable code
- Proper error handling
- No secrets or credentials
- Tests for new behavior
- Documentation for public APIs
- No unnecessary dependencies

---

## Reporting Issues

### Bug Reports

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Logs or error messages

### Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md). Include:
- Problem you're trying to solve
- Proposed solution
- Alternatives considered

---

## Need Help?

- Open a [Discussion](https://github.com/your-org/DevLock/discussions) for questions
- Check existing issues before creating new ones
- Tag issues with appropriate labels

Thank you for contributing to DevLock! 🔒
