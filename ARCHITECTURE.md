# DevLock — Enterprise Technical Architecture Blueprint

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [High-Level Architecture](#high-level-architecture)
3. [Service Breakdown](#service-breakdown)
4. [Multi-Tenant Strategy](#multi-tenant-strategy)
5. [SDK Communication Flow](#sdk-communication-flow)
6. [Authentication Architecture](#authentication-architecture)
7. [Security Architecture](#security-architecture)
8. [WebSocket Architecture](#websocket-architecture)
9. [Database Architecture](#database-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Scaling Strategy](#scaling-strategy)
12. [Rate Limiting Strategy](#rate-limiting-strategy)
13. [Caching Strategy](#caching-strategy)
14. [Queue System Architecture](#queue-system-architecture)
15. [License Validation Flow](#license-validation-flow)
16. [Remote Config Flow](#remote-config-flow)
17. [Kill-Switch Flow](#kill-switch-flow)
18. [Tamper Detection Flow](#tamper-detection-flow)
19. [Domain Verification System](#domain-verification-system)
20. [Offline License Support](#offline-license-support)
21. [API Gateway Structure](#api-gateway-structure)
22. [Microservices Recommendation](#microservices-recommendation)
23. [Monorepo Structure](#monorepo-structure)
24. [CI/CD Pipeline](#cicd-pipeline)
25. [Observability Stack](#observability-stack)
26. [SaaS Subscription System](#saas-subscription-system)
27. [Production Best Practices](#production-best-practices)
28. [Enterprise Security Recommendations](#enterprise-security-recommendations)

---

## 1. Executive Summary

DevLock is a multi-tenant SaaS platform enabling software developers to protect, license, and remotely manage their distributed applications. It provides real-time control over deployed software through lightweight SDKs that communicate with centralized infrastructure.

**Core Value Proposition:**
- License enforcement across frontend and backend applications
- Real-time remote management (suspend, maintain, notify, kill)
- Domain-locked deployments preventing unauthorized redistribution
- Feature flag management with instant propagation
- Tamper detection and anti-piracy mechanisms
- Offline-capable license validation with cryptographic verification

**Architecture Principles:**
- Event-driven, real-time-first design
- Zero-trust security model
- Horizontal scalability at every layer
- Tenant isolation with shared infrastructure efficiency
- Sub-100ms SDK response times globally
- 99.99% uptime SLA target

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVLOCK PLATFORM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │   Admin      │    │   Developer  │    │   End-User Applications      │  │
│  │   Dashboard  │    │   Portal     │    │   (SDK-Integrated)           │  │
│  │   (Next.js)  │    │   (Next.js)  │    │   ┌────────┐ ┌────────┐     │  │
│  └──────┬───────┘    └──────┬───────┘    │   │Frontend│ │Backend │     │  │
│         │                   │            │   │  SDK   │ │  SDK   │     │  │
│         │                   │            │   └───┬────┘ └───┬────┘     │  │
│         │                   │            └───────┼──────────┼──────────┘  │
│         │                   │                    │          │             │
│  ┌──────▼───────────────────▼────────────────────▼──────────▼──────────┐  │
│  │                     API GATEWAY (Nginx + Express)                    │  │
│  │              Rate Limiting │ Auth │ Routing │ Load Balancing         │  │
│  └──────────────────────────────┬──────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────▼──────────────────────────────────────┐  │
│  │                      SERVICE MESH                                    │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │  │
│  │  │License  │ │Config   │ │Notify   │ │Analytics│ │Identity │     │  │
│  │  │Service  │ │Service  │ │Service  │ │Service  │ │Service  │     │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘     │  │
│  │       │           │           │           │           │            │  │
│  │  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐                              │  │
│  │  │Domain   │ │Feature  │ │Billing  │                              │  │
│  │  │Service  │ │Flag Svc │ │Service  │                              │  │
│  │  └─────────┘ └─────────┘ └─────────┘                              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────▼──────────────────────────────────────┐  │
│  │                      DATA LAYER                                      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────────┐  │  │
│  │  │MongoDB  │ │ Redis   │ │ BullMQ  │ │ Socket.IO (Redis Adapter)│  │  │
│  │  │(Primary)│ │(Cache/  │ │(Queues) │ │ (Real-time)             │  │  │
│  │  │         │ │ Pub/Sub)│ │         │ │                         │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Service Breakdown

### Core Services

| Service | Responsibility | Port | Protocol |
|---------|---------------|------|----------|
| **API Gateway** | Request routing, rate limiting, auth verification | 3000 | HTTP/WS |
| **License Service** | License CRUD, validation, activation, revocation | 3001 | HTTP |
| **Config Service** | Remote configuration, feature flags, kill-switch | 3002 | HTTP/WS |
| **Notification Service** | Push notifications, in-app messages, warnings | 3003 | HTTP/WS |
| **Identity Service** | Auth, tenant management, API keys, RBAC | 3004 | HTTP |
| **Domain Service** | Domain verification, DNS checks, lock enforcement | 3005 | HTTP |
| **Analytics Service** | Usage tracking, audit logs, telemetry | 3006 | HTTP |
| **Billing Service** | Subscription management, usage metering, invoicing | 3007 | HTTP |
| **Feature Flag Service** | Flag management, A/B testing, gradual rollouts | 3008 | HTTP/WS |
| **WebSocket Gateway** | Real-time connection management, event broadcasting | 3010 | WS |

### Supporting Services

| Service | Responsibility |
|---------|---------------|
| **Queue Worker** | Async job processing (email, webhooks, analytics) |
| **Scheduler** | Cron jobs (license expiry checks, domain re-verification) |
| **Webhook Dispatcher** | Outbound webhook delivery with retry logic |

---

## 4. Multi-Tenant Strategy

### Approach: Shared Database with Tenant Isolation

```
┌─────────────────────────────────────────────────┐
│              TENANT ISOLATION MODEL              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Strategy: Shared DB + Tenant ID Partitioning   │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  MongoDB Collections                      │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Every document contains:            │  │  │
│  │  │   tenantId: ObjectId (indexed)      │  │  │
│  │  │   Compound indexes: [tenantId, ...]  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Isolation Guarantees:                          │
│  • Query-level: All queries scoped by tenantId  │
│  • Middleware: Auto-inject tenantId from JWT     │
│  • Index-level: Compound indexes ensure perf    │
│  • Cache-level: Redis keys prefixed by tenant   │
│  • WS-level: Socket rooms per tenant            │
│                                                 │
│  Enterprise Tier (Optional):                    │
│  • Dedicated MongoDB replica set                │
│  • Dedicated Redis instance                     │
│  • Isolated Socket.IO namespace                 │
│  • Custom domain for dashboard                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Tenant Context Propagation

```typescript
// Middleware extracts tenant from JWT/API key and attaches to request
interface TenantContext {
  tenantId: string;
  plan: 'free' | 'pro' | 'enterprise';
  limits: TenantLimits;
  features: string[];
}

// All service calls carry tenant context
// All DB queries are automatically scoped
// All cache keys are tenant-prefixed
```

---

## 5. SDK Communication Flow

### Frontend SDK Flow

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  Client App      │         │  DevLock CDN     │         │  DevLock API     │
│  (Browser)       │         │  (Edge Cache)    │         │  (Origin)        │
└────────┬─────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                            │                            │
         │  1. Init SDK (projectKey)  │                            │
         │───────────────────────────►│                            │
         │                            │  2. Cache MISS             │
         │                            │───────────────────────────►│
         │                            │  3. Config + License State │
         │                            │◄───────────────────────────│
         │  4. Cached Response        │                            │
         │◄───────────────────────────│                            │
         │                            │                            │
         │  5. Establish WebSocket    │                            │
         │─────────────────────────────────────────────────────────►
         │                            │                            │
         │  6. Real-time updates (suspend, maintain, notify)       │
         │◄─────────────────────────────────────────────────────────
         │                            │                            │
         │  7. Heartbeat (every 30s)  │                            │
         │─────────────────────────────────────────────────────────►
         │                            │                            │
```

### Backend SDK Flow

```
┌──────────────────┐                          ┌──────────────────┐
│  Server App      │                          │  DevLock API     │
│  (Node.js)       │                          │  (Origin)        │
└────────┬─────────┘                          └────────┬─────────┘
         │                                             │
         │  1. Init SDK (secretKey + projectId)        │
         │────────────────────────────────────────────►│
         │  2. Signed config payload (JWT)             │
         │◄────────────────────────────────────────────│
         │                                             │
         │  3. Validate license (per-request middleware)│
         │────────────────────────────────────────────►│
         │  4. Validation result (cached 5min)         │
         │◄────────────────────────────────────────────│
         │                                             │
         │  5. WebSocket for real-time kill-switch     │
         │◄───────────────────────────────────────────►│
         │                                             │
         │  6. Periodic sync (every 5min)              │
         │────────────────────────────────────────────►│
         │  7. Full state refresh                      │
         │◄────────────────────────────────────────────│
```

### SDK Authentication

```
SDK Init Request:
  Headers:
    X-DevLock-Key: <project_public_key>     (frontend)
    X-DevLock-Secret: <project_secret_key>  (backend)
    X-DevLock-Signature: HMAC-SHA256(body, secret)
    X-DevLock-Timestamp: <unix_ms>
    X-DevLock-Domain: <origin_domain>       (frontend, auto-detected)
    
  Body:
    {
      projectId: string,
      sdkVersion: string,
      environment: 'production' | 'staging' | 'development',
      fingerprint: string  // machine/browser fingerprint
    }
```

---

## 6. Authentication Architecture

### Multi-Layer Auth System

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Dashboard Users (Admin/Developer)                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • JWT (access token: 15min, refresh token: 7d)         │    │
│  │  • OAuth 2.0 (Google, GitHub, GitLab)                   │    │
│  │  • MFA via TOTP (mandatory for enterprise)              │    │
│  │  • Session management with Redis                        │    │
│  │  • IP allowlisting (enterprise)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 2: SDK Authentication (Project Keys)                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • Public Key: Frontend SDK (domain-locked)             │    │
│  │  • Secret Key: Backend SDK (HMAC-signed requests)       │    │
│  │  • Key rotation support (grace period for old keys)     │    │
│  │  • Per-environment keys (prod/staging/dev)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 3: License Keys (End-User Validation)                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • Format: DLCK-XXXX-XXXX-XXXX-XXXX (Base32)           │    │
│  │  • Cryptographically signed (Ed25519)                   │    │
│  │  • Embeds: tenantId, projectId, tier, expiry            │    │
│  │  • Offline-verifiable via embedded public key           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 4: Inter-Service Communication                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • mTLS between services                               │    │
│  │  • Service tokens (short-lived, auto-rotated)           │    │
│  │  • Request signing for queue messages                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### RBAC Model

```typescript
enum Role {
  OWNER = 'owner',           // Full tenant control
  ADMIN = 'admin',           // Manage projects, users, billing
  DEVELOPER = 'developer',   // Manage own projects, view analytics
  VIEWER = 'viewer',         // Read-only access
  BILLING = 'billing',       // Billing management only
}

// Permissions are additive, role-based with optional overrides
interface Permission {
  resource: string;    // 'project', 'license', 'config', 'billing'
  actions: string[];   // 'create', 'read', 'update', 'delete', 'execute'
  scope: 'own' | 'team' | 'tenant';
}
```

---

## 7. Security Architecture

### Defense-in-Depth Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Edge Layer:                                                     │
│  • DDoS protection (Cloudflare/AWS Shield)                      │
│  • WAF rules (OWASP Top 10)                                    │
│  • Geo-blocking (optional per tenant)                           │
│  • TLS 1.3 termination                                          │
│                                                                  │
│  Gateway Layer:                                                  │
│  • Rate limiting (token bucket per API key)                     │
│  • Request validation (JSON Schema)                             │
│  • CORS enforcement                                             │
│  • Request size limits (1MB default)                            │
│  • IP reputation scoring                                        │
│                                                                  │
│  Application Layer:                                              │
│  • Input sanitization (XSS, SQL injection prevention)           │
│  • HMAC request signing verification                            │
│  • Timestamp validation (±5min drift tolerance)                 │
│  • Idempotency keys for mutations                               │
│  • CSP headers for dashboard                                    │
│                                                                  │
│  Data Layer:                                                     │
│  • Encryption at rest (AES-256)                                 │
│  • Encryption in transit (TLS 1.3)                              │
│  • Field-level encryption for sensitive data                    │
│  • Key management via external KMS                              │
│  • Automated secret rotation                                    │
│                                                                  │
│  SDK Security:                                                   │
│  • Code obfuscation (optional, configurable)                    │
│  • Integrity checksums (SDK self-verification)                  │
│  • Anti-debugging detection                                     │
│  • Certificate pinning for API calls                            │
│  • Tamper-evident license tokens                                │
│                                                                  │
│  Audit & Compliance:                                             │
│  • Immutable audit log (append-only collection)                 │
│  • SOC 2 Type II controls                                       │
│  • GDPR data handling (right to erasure, export)                │
│  • Data residency options (EU, US, APAC)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| License key theft | Domain locking + machine fingerprinting |
| SDK tampering | Integrity checksums + server-side validation |
| Replay attacks | Timestamp + nonce in signed requests |
| Man-in-the-middle | Certificate pinning + TLS 1.3 |
| Brute force | Rate limiting + progressive delays + account lockout |
| Data exfiltration | Field-level encryption + audit logging |
| Tenant data leakage | Query-level isolation + automated testing |
| DDoS on SDK endpoints | Edge caching + rate limiting + circuit breakers |

---

## 8. WebSocket Architecture

### Connection Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐   │
│  │ SDK Client  │────►│   Nginx     │────►│  Socket.IO Server   │   │
│  │ (Browser/   │     │  (Sticky    │     │  (Clustered)        │   │
│  │  Node.js)   │     │   Sessions) │     │                     │   │
│  └─────────────┘     └─────────────┘     └──────────┬──────────┘   │
│                                                      │              │
│                                           ┌──────────▼──────────┐   │
│                                           │  Redis Adapter      │   │
│                                           │  (Pub/Sub for       │   │
│                                           │   cross-node msgs)  │   │
│                                           └─────────────────────┘   │
│                                                                      │
│  Room Structure:                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  tenant:{tenantId}              — All connections for tenant │    │
│  │  project:{projectId}            — All instances of project  │    │
│  │  license:{licenseId}            — Specific license holder   │    │
│  │  admin:{tenantId}               — Admin dashboard sessions  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Events (Server → SDK):                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  license:suspended      — Immediate license suspension      │    │
│  │  license:revoked        — Permanent license revocation      │    │
│  │  license:renewed        — License reactivation              │    │
│  │  config:updated         — Remote config change              │    │
│  │  maintenance:enabled    — Maintenance mode activated        │    │
│  │  maintenance:disabled   — Maintenance mode deactivated      │    │
│  │  notification:push      — In-app notification/warning       │    │
│  │  feature:toggled        — Feature flag change               │    │
│  │  killswitch:activated   — Emergency shutdown                │    │
│  │  domain:blocked         — Domain verification failed        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Events (SDK → Server):                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  heartbeat              — Connection alive signal           │    │
│  │  ack:{eventId}          — Event receipt acknowledgment      │    │
│  │  telemetry:batch        — Batched usage telemetry           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Scaling WebSockets

```
Nginx Configuration (Sticky Sessions):
  - ip_hash for WebSocket upgrade requests
  - Connection: upgrade header forwarding
  - Proxy timeout: 3600s (1 hour)

Socket.IO Configuration:
  - Redis adapter for cross-node communication
  - Connection state recovery (Socket.IO v4.6+)
  - Binary parser for efficient payload encoding
  - Per-message compression (permessage-deflate)

Capacity Planning:
  - ~50,000 concurrent connections per Socket.IO node
  - Horizontal scaling via Redis adapter
  - Connection draining on deploy (graceful shutdown)
```

---

## 9. Database Architecture

### MongoDB Schema Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE COLLECTIONS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  tenants                                                         │
│  ├── _id: ObjectId                                              │
│  ├── name: String                                               │
│  ├── slug: String (unique)                                      │
│  ├── plan: Enum (free, pro, enterprise)                         │
│  ├── owner: ObjectId → users                                    │
│  ├── settings: { customDomain, branding, limits }               │
│  ├── billing: { stripeCustomerId, subscriptionId }              │
│  ├── createdAt, updatedAt                                       │
│  └── Indexes: [slug], [owner]                                   │
│                                                                  │
│  users                                                           │
│  ├── _id: ObjectId                                              │
│  ├── tenantId: ObjectId → tenants                               │
│  ├── email: String (unique per tenant)                          │
│  ├── passwordHash: String (bcrypt, cost 12)                     │
│  ├── role: Enum                                                 │
│  ├── mfa: { enabled, secret, backupCodes }                     │
│  ├── sessions: [{ token, ip, userAgent, expiresAt }]           │
│  └── Indexes: [tenantId, email], [tenantId, role]              │
│                                                                  │
│  projects                                                        │
│  ├── _id: ObjectId                                              │
│  ├── tenantId: ObjectId → tenants                               │
│  ├── name: String                                               │
│  ├── publicKey: String (unique)                                 │
│  ├── secretKey: String (encrypted)                              │
│  ├── allowedDomains: [String]                                   │
│  ├── settings: { maintenance, killSwitch, notifications }       │
│  ├── sdkConfig: { version, features, customMessages }          │
│  └── Indexes: [tenantId], [publicKey], [tenantId, name]        │
│                                                                  │
│  licenses                                                        │
│  ├── _id: ObjectId                                              │
│  ├── tenantId: ObjectId → tenants                               │
│  ├── projectId: ObjectId → projects                             │
│  ├── key: String (unique, encrypted at rest)                    │
│  ├── status: Enum (active, suspended, expired, revoked)         │
│  ├── type: Enum (perpetual, subscription, trial, floating)      │
│  ├── activations: [{ fingerprint, domain, ip, activatedAt }]   │
│  ├── maxActivations: Number                                     │
│  ├── metadata: Mixed (custom fields)                            │
│  ├── expiresAt: Date                                            │
│  ├── suspendedAt: Date                                          │
│  ├── lastValidatedAt: Date                                      │
│  └── Indexes: [tenantId, projectId], [key], [status, expiresAt]│
│                                                                  │
│  configs                                                         │
│  ├── _id: ObjectId                                              │
│  ├── tenantId: ObjectId                                         │
│  ├── projectId: ObjectId → projects                             │
│  ├── version: Number (incrementing)                             │
│  ├── maintenance: { enabled, message, allowedIPs }             │
│  ├── killSwitch: { enabled, reason }                           │
│  ├── notifications: [{ id, type, message, severity, active }]  │
│  ├── featureFlags: Map<String, { enabled, rules }>             │
│  ├── domainLock: { enabled, domains, action }                  │
│  └── Indexes: [tenantId, projectId], [projectId, version]      │
│                                                                  │
│  audit_logs (Capped/TTL Collection)                              │
│  ├── _id: ObjectId                                              │
│  ├── tenantId: ObjectId                                         │
│  ├── actor: { type, id, ip, userAgent }                        │
│  ├── action: String                                             │
│  ├── resource: { type, id }                                    │
│  ├── changes: { before, after }                                │
│  ├── timestamp: Date                                            │
│  └── Indexes: [tenantId, timestamp], [tenantId, action]        │
│                                                                  │
│  analytics_events (Time-Series Collection)                       │
│  ├── tenantId: ObjectId                                         │
│  ├── projectId: ObjectId                                        │
│  ├── licenseId: ObjectId                                        │
│  ├── event: String                                              │
│  ├── metadata: Mixed                                            │
│  ├── timestamp: Date                                            │
│  └── Indexes: [tenantId, projectId, timestamp]                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### MongoDB Deployment

```
Replica Set Configuration:
  - Primary: Writes + consistent reads
  - Secondary 1: Read replicas (analytics queries)
  - Secondary 2: Read replicas (SDK validation queries)
  - Arbiter: Failover voting

Sharding Strategy (at scale):
  - Shard key: { tenantId: 1, _id: 1 } (hashed)
  - Ensures tenant data locality
  - Even distribution across shards
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT TOPOLOGY                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CDN / Edge (Cloudflare / AWS CloudFront)                       │    │
│  │  • Static assets (Dashboard, SDK bundles)                       │    │
│  │  • Edge caching for config responses                            │    │
│  │  • DDoS protection                                              │    │
│  │  • SSL termination                                              │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  Load Balancer (Nginx / AWS ALB)                                │    │
│  │  • Health checks                                                │    │
│  │  • SSL termination (internal)                                   │    │
│  │  • WebSocket upgrade handling                                   │    │
│  │  • Sticky sessions (IP hash for WS)                            │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │  Docker Swarm / Kubernetes Cluster                              │    │
│  │                                                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │API GW x3 │ │License x2│ │Config x2 │ │WS GW x3  │          │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │Identity  │ │Domain x1 │ │Analytics │ │Billing x1│          │    │
│  │  │  x2      │ │          │ │  x2      │ │          │          │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │    │
│  │  ┌──────────┐ ┌──────────┐                                     │    │
│  │  │Worker x3 │ │Scheduler │                                     │    │
│  │  │          │ │  x1      │                                     │    │
│  │  └──────────┘ └──────────┘                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Data Tier (Managed Services Preferred)                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │ MongoDB Atlas │  │ Redis Cluster│  │ Object Store │         │    │
│  │  │ (M30+ prod)  │  │ (6-node)     │  │ (S3/Minio)   │         │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Docker Compose (Development/Staging)

```yaml
# Simplified — full compose in /docker/docker-compose.yml
services:
  gateway:     { build: ./apps/gateway, ports: ['3000:3000'] }
  license:     { build: ./apps/license-service }
  config:      { build: ./apps/config-service }
  identity:    { build: ./apps/identity-service }
  websocket:   { build: ./apps/websocket-gateway, ports: ['3010:3010'] }
  worker:      { build: ./apps/queue-worker }
  dashboard:   { build: ./apps/dashboard, ports: ['4000:3000'] }
  mongodb:     { image: 'mongo:7', volumes: ['mongo_data:/data/db'] }
  redis:       { image: 'redis:7-alpine', command: 'redis-server --appendonly yes' }
  nginx:       { image: 'nginx:alpine', ports: ['80:80', '443:443'] }
```

---

## 11. Scaling Strategy

### Horizontal Scaling Matrix

| Component | Scaling Trigger | Strategy | Max per Node |
|-----------|----------------|----------|--------------|
| API Gateway | CPU > 70% or RPS > 5000 | Auto-scale replicas | 10K RPS |
| License Service | RPS > 3000 | Replica scaling + read replicas | 5K RPS |
| WebSocket Gateway | Connections > 40K | Add nodes + Redis adapter | 50K conn |
| Config Service | Cache miss rate > 20% | Scale + warm cache | 8K RPS |
| Queue Workers | Queue depth > 1000 | Scale workers dynamically | 500 jobs/s |
| MongoDB | Storage > 80% or ops > 10K/s | Shard + replica scaling | — |
| Redis | Memory > 75% | Cluster mode + add nodes | 100K ops/s |

### Scaling Tiers

```
Tier 1 (0-1K tenants):
  - Single node per service
  - MongoDB replica set (3 nodes)
  - Redis single instance
  - Estimated: 2-4 servers

Tier 2 (1K-10K tenants):
  - 2-3 replicas per service
  - MongoDB sharded cluster
  - Redis cluster (6 nodes)
  - Dedicated WebSocket nodes
  - Estimated: 12-20 servers

Tier 3 (10K+ tenants):
  - Auto-scaling groups per service
  - Multi-region deployment
  - Global Redis with local caches
  - CDN for all SDK responses
  - Estimated: 30+ servers, multi-AZ
```

---

## 12. Rate Limiting Strategy

### Multi-Tier Rate Limiting

```
┌─────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING TIERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tier 1: Global (Edge/CDN)                                      │
│  • 10,000 req/min per IP                                        │
│  • Blocks known bad actors                                      │
│                                                                  │
│  Tier 2: Per API Key (Gateway)                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Free Plan:    100 req/min,   10K req/day                │    │
│  │  Pro Plan:     1000 req/min,  500K req/day               │    │
│  │  Enterprise:   10000 req/min, Unlimited                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Tier 3: Per Endpoint (Service)                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  License validation:  500 req/min (cached responses)     │    │
│  │  Config fetch:        200 req/min (use WebSocket)        │    │
│  │  Admin mutations:     50 req/min                         │    │
│  │  Auth endpoints:      10 req/min (brute force protect)   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Implementation: Redis Token Bucket                              │
│  • Sliding window counter                                       │
│  • Lua script for atomic decrement                              │
│  • Headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After│
│  • Graceful degradation: serve cached on limit hit              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Caching Strategy

### Cache Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  L1: SDK In-Memory Cache (Client-Side)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • License state: 5 min TTL                             │    │
│  │  • Config/flags: 2 min TTL                              │    │
│  │  • Invalidated by WebSocket events                      │    │
│  │  • Fallback for network failures                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  L2: CDN Edge Cache                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • Public config: 60s TTL (stale-while-revalidate: 300s)│    │
│  │  • SDK bundles: 24h TTL (versioned URLs)                │    │
│  │  • Cache-Control + ETag for conditional requests        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  L3: Redis Application Cache                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Key Patterns:                                          │    │
│  │  • license:{key}:status     → 5 min TTL                │    │
│  │  • config:{projectId}:v     → 2 min TTL                │    │
│  │  • tenant:{id}:limits       → 10 min TTL               │    │
│  │  • ratelimit:{apiKey}:{win} → sliding window           │    │
│  │  • session:{token}          → session duration          │    │
│  │                                                         │    │
│  │  Invalidation:                                          │    │
│  │  • Event-driven (publish on mutation)                   │    │
│  │  • Pattern-based deletion on bulk operations            │    │
│  │  • Version-stamped keys for atomic updates              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  L4: MongoDB Query Cache                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  • WiredTiger internal cache (50% RAM)                  │    │
│  │  • Read preference: secondaryPreferred for analytics    │    │
│  │  • Covered queries via compound indexes                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Strategy

```
Event-Driven Invalidation:
  1. Admin updates config → Write to DB
  2. Publish Redis event: config:updated:{projectId}
  3. All service instances invalidate local cache
  4. WebSocket broadcasts to connected SDKs
  5. SDKs invalidate L1 cache + fetch fresh data
  6. CDN purge via API (for edge-cached responses)

Result: Sub-second propagation from admin action to SDK state change
```

---

## 14. Queue System Architecture

### BullMQ Job Queues

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUEUE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Queue: license-events                                           │
│  ├── Jobs: expiry-check, activation-notify, usage-sync          │
│  ├── Concurrency: 10                                            │
│  ├── Retry: 3 attempts, exponential backoff                     │
│  └── Priority: high                                             │
│                                                                  │
│  Queue: notifications                                            │
│  ├── Jobs: email, webhook, push, in-app                         │
│  ├── Concurrency: 20                                            │
│  ├── Retry: 5 attempts, exponential backoff                     │
│  └── Priority: medium                                           │
│                                                                  │
│  Queue: analytics                                                │
│  ├── Jobs: event-ingest, aggregate, report-generate             │
│  ├── Concurrency: 30                                            │
│  ├── Retry: 2 attempts                                          │
│  └── Priority: low (batch processing)                           │
│                                                                  │
│  Queue: domain-verification                                      │
│  ├── Jobs: dns-check, ssl-verify, re-verify                    │
│  ├── Concurrency: 5                                             │
│  ├── Retry: 3 attempts, 1h delay                               │
│  └── Priority: medium                                           │
│                                                                  │
│  Queue: webhooks                                                 │
│  ├── Jobs: deliver, retry-failed                                │
│  ├── Concurrency: 15                                            │
│  ├── Retry: 8 attempts, exponential (up to 24h)                │
│  └── Dead letter queue after max retries                        │
│                                                                  │
│  Scheduled Jobs (Cron):                                          │
│  ├── License expiry scan: every 1h                              │
│  ├── Domain re-verification: every 24h                          │
│  ├── Analytics aggregation: every 15min                         │
│  ├── Stale session cleanup: every 6h                            │
│  └── Usage metering snapshot: every 1h                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. License Validation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LICENSE VALIDATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SDK Request:                                                            │
│  POST /v1/licenses/validate                                              │
│  { licenseKey, fingerprint, domain, projectId }                         │
│                                                                          │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐          │
│  │  SDK    │────►│ Gateway │────►│  Redis  │     │ MongoDB │          │
│  └─────────┘     └────┬────┘     └────┬────┘     └────┬────┘          │
│                       │               │               │                 │
│                       │  1. Rate check │               │                 │
│                       │───────────────►│               │                 │
│                       │  OK            │               │                 │
│                       │◄───────────────│               │                 │
│                       │                │               │                 │
│                       │  2. Cache lookup│               │                 │
│                       │───────────────►│               │                 │
│                       │                │               │                 │
│                       │  [CACHE HIT]   │               │                 │
│                       │◄── return ─────│               │                 │
│                       │                │               │                 │
│                       │  [CACHE MISS]  │               │                 │
│                       │  3. DB lookup  │               │                 │
│                       │───────────────────────────────►│                 │
│                       │  4. License doc│               │                 │
│                       │◄──────────────────────────────│                 │
│                       │                │               │                 │
│                       │  5. Validate:  │               │                 │
│                       │  • Status == active            │                 │
│                       │  • Not expired                 │                 │
│                       │  • Domain matches              │                 │
│                       │  • Activation limit OK         │                 │
│                       │  • Fingerprint registered      │                 │
│                       │                │               │                 │
│                       │  6. Cache result│               │                 │
│                       │───────────────►│               │                 │
│                       │                │               │                 │
│                       │  7. Return signed response     │                 │
│                       │                │               │                 │
│                                                                          │
│  Response (Signed JWT):                                                  │
│  {                                                                       │
│    valid: boolean,                                                       │
│    status: 'active' | 'suspended' | 'expired' | 'revoked',             │
│    features: string[],                                                   │
│    expiresAt: ISO8601,                                                  │
│    config: { maintenance, notifications, flags },                       │
│    signature: Ed25519(payload, serverPrivateKey)                         │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Remote Config Flow

```
Admin Action → Real-time Propagation:

  1. Admin clicks "Enable Maintenance Mode" in dashboard
  2. Dashboard sends: PUT /v1/projects/:id/config
     { maintenance: { enabled: true, message: "Back in 1 hour" } }
  3. Config Service:
     a. Validates request + permissions
     b. Updates MongoDB (atomic, versioned)
     c. Invalidates Redis cache
     d. Publishes to Redis Pub/Sub: config:updated:{projectId}
  4. WebSocket Gateway receives pub/sub event
  5. Broadcasts to room: project:{projectId}
     Event: maintenance:enabled
     Payload: { message: "Back in 1 hour", estimatedEnd: ISO8601 }
  6. All connected SDKs receive event in <100ms
  7. SDKs that are offline will sync on next heartbeat/reconnect

  Consistency Guarantee:
  • Config has monotonic version number
  • SDK tracks last-seen version
  • On reconnect, SDK sends version → server sends diff if stale
  • Prevents out-of-order updates
```

---

## 17. Kill-Switch Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KILL-SWITCH ACTIVATION                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Trigger: Admin activates kill-switch OR automated fraud detection       │
│                                                                          │
│  Flow:                                                                   │
│  1. POST /v1/projects/:id/killswitch                                    │
│     { enabled: true, reason: "License violation detected" }             │
│                                                                          │
│  2. Config Service:                                                      │
│     • Sets killSwitch.enabled = true in DB                              │
│     • Logs to audit trail (immutable)                                   │
│     • Invalidates ALL caches for project                                │
│     • Publishes: killswitch:activated:{projectId}                       │
│                                                                          │
│  3. WebSocket Gateway:                                                   │
│     • Broadcasts to ALL connections in project:{projectId}              │
│     • Event: killswitch:activated                                       │
│     • Payload: { reason, timestamp, gracePeriod: 0 }                   │
│                                                                          │
│  4. SDK Response (Frontend):                                             │
│     • Immediately renders blocking overlay                              │
│     • Disables all application functionality                            │
│     • Shows configurable message                                        │
│     • No user bypass possible                                           │
│                                                                          │
│  5. SDK Response (Backend):                                              │
│     • Returns 503 for all protected routes                              │
│     • Logs shutdown event                                               │
│     • Graceful connection draining (configurable)                       │
│                                                                          │
│  6. Offline Clients:                                                     │
│     • Next validation attempt returns kill state                        │
│     • Cached license marked invalid                                     │
│     • Grace period: 0 (immediate) for kill-switch                      │
│                                                                          │
│  Recovery:                                                               │
│     • Admin deactivates kill-switch                                     │
│     • Same propagation flow in reverse                                  │
│     • SDKs auto-recover on next heartbeat                               │
│     • Audit log records recovery event                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 18. Tamper Detection Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TAMPER DETECTION SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Detection Vectors:                                                      │
│                                                                          │
│  1. SDK Integrity Check                                                  │
│     • SDK computes its own SHA-256 hash on initialization               │
│     • Compares against known-good hash from server                      │
│     • If mismatch → report tampering + degrade gracefully              │
│                                                                          │
│  2. Response Signature Verification                                      │
│     • All server responses are Ed25519 signed                           │
│     • SDK verifies signature with embedded public key                   │
│     • Prevents MITM injection of fake "valid" responses                 │
│                                                                          │
│  3. Clock Manipulation Detection                                         │
│     • SDK compares local time with server time on each sync             │
│     • Drift > 5 minutes triggers warning                                │
│     • Drift > 1 hour triggers license re-validation                    │
│     • Prevents expiry bypass via clock manipulation                     │
│                                                                          │
│  4. Debug/DevTools Detection (Frontend SDK)                              │
│     • Detects open developer tools (optional, configurable)             │
│     • Detects common debugging patterns                                 │
│     • Reports to analytics (does not block by default)                  │
│                                                                          │
│  5. Network Interception Detection                                       │
│     • Certificate pinning for API endpoints                             │
│     • Detects proxy/MITM certificates                                   │
│     • Falls back to offline validation if pinning fails                 │
│                                                                          │
│  6. License Token Integrity                                              │
│     • License responses include HMAC of critical fields                 │
│     • SDK verifies HMAC before trusting cached state                    │
│     • Prevents local storage manipulation                               │
│                                                                          │
│  Response to Tampering:                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Level 1 (Warning):  Log event, notify admin, continue         │    │
│  │  Level 2 (Degrade):  Disable premium features, show warning    │    │
│  │  Level 3 (Block):    Full application lockout                  │    │
│  │  Level 4 (Report):   Automated license suspension + alert      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Configurable per project — developers choose enforcement level         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 19. Domain Verification System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DOMAIN VERIFICATION                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Verification Methods:                                                   │
│                                                                          │
│  Method 1: DNS TXT Record                                                │
│  • User adds: TXT _devlock.example.com → "devlock-verify=abc123"       │
│  • Server performs DNS lookup to verify                                  │
│  • Re-verified every 24 hours                                           │
│                                                                          │
│  Method 2: Meta Tag (Frontend)                                           │
│  • User adds: <meta name="devlock-verify" content="abc123">            │
│  • Server fetches page and checks meta tag                              │
│  • Verified on first SDK init from that domain                          │
│                                                                          │
│  Method 3: File Verification                                             │
│  • User places: /.well-known/devlock-verify.txt                        │
│  • Contains verification token                                          │
│  • Server performs HTTP GET to verify                                   │
│                                                                          │
│  Runtime Domain Enforcement (Frontend SDK):                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  1. SDK reads window.location.hostname                          │    │
│  │  2. Sends domain in init request header                         │    │
│  │  3. Server checks domain against project.allowedDomains         │    │
│  │  4. If mismatch:                                                │    │
│  │     • action: 'warn'  → Log + notify admin                     │    │
│  │     • action: 'block' → Refuse to initialize                   │    │
│  │     • action: 'kill'  → Activate kill-switch                   │    │
│  │  5. Wildcard support: *.example.com                             │    │
│  │  6. localhost/127.0.0.1 always allowed in dev mode              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Anti-Spoofing:                                                          │
│  • Referer header cross-check                                           │
│  • Server-side domain verification (not just client-reported)           │
│  • Periodic re-verification via background jobs                         │
│  • Alert on domain mismatch patterns                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 20. Offline License Support

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OFFLINE LICENSE SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Design Principle: Licenses must work without network connectivity       │
│  for a configurable grace period.                                        │
│                                                                          │
│  Cryptographic Offline Token:                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Structure (JWT-like, Ed25519 signed):                          │    │
│  │  {                                                              │    │
│  │    header: { alg: 'EdDSA', typ: 'DLK' },                      │    │
│  │    payload: {                                                   │    │
│  │      lid: 'license_id',                                        │    │
│  │      tid: 'tenant_id',                                         │    │
│  │      pid: 'project_id',                                        │    │
│  │      sts: 'active',                                            │    │
│  │      fts: ['feature1', 'feature2'],                            │    │
│  │      exp: unix_timestamp,        // license expiry             │    │
│  │      grc: 72,                    // offline grace hours        │    │
│  │      iat: unix_timestamp,        // token issued at            │    │
│  │      nxt: unix_timestamp,        // next required check-in     │    │
│  │      fp:  'fingerprint_hash',    // bound to machine           │    │
│  │      dom: ['example.com'],       // allowed domains            │    │
│  │    },                                                           │    │
│  │    signature: Ed25519(header + payload, serverPrivateKey)       │    │
│  │  }                                                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Offline Validation Logic (SDK-side):                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  1. Load cached offline token from secure storage               │    │
│  │  2. Verify Ed25519 signature (public key embedded in SDK)       │    │
│  │  3. Check: current_time < token.exp (license not expired)       │    │
│  │  4. Check: current_time < token.iat + (token.grc * 3600)       │    │
│  │  5. Check: fingerprint matches current machine                  │    │
│  │  6. Check: domain matches (frontend only)                       │    │
│  │  7. If all pass → license valid offline                         │    │
│  │  8. If grace expired → degrade to limited mode                  │    │
│  │  9. Attempt online re-validation in background                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Grace Period Tiers:                                                     │
│  • Free: 24 hours offline                                               │
│  • Pro: 72 hours offline                                                │
│  • Enterprise: 168 hours (7 days) offline                               │
│  • Custom: Configurable per license                                     │
│                                                                          │
│  Storage:                                                                │
│  • Frontend: Encrypted localStorage + IndexedDB backup                  │
│  • Backend: Encrypted file in node_modules/.devlock/cache               │
│  • Token refreshed on every successful online validation                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 21. API Gateway Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY ROUTES                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Base URL: https://api.devlock.io/v1                                    │
│                                                                          │
│  Authentication:                                                         │
│  POST   /auth/register                                                  │
│  POST   /auth/login                                                     │
│  POST   /auth/refresh                                                   │
│  POST   /auth/logout                                                    │
│  POST   /auth/mfa/enable                                                │
│  POST   /auth/mfa/verify                                                │
│  POST   /auth/forgot-password                                           │
│  POST   /auth/reset-password                                            │
│                                                                          │
│  Tenants:                                                                │
│  GET    /tenants/me                                                     │
│  PUT    /tenants/me                                                     │
│  GET    /tenants/me/usage                                               │
│                                                                          │
│  Projects:                                                               │
│  GET    /projects                                                       │
│  POST   /projects                                                       │
│  GET    /projects/:id                                                   │
│  PUT    /projects/:id                                                   │
│  DELETE /projects/:id                                                   │
│  POST   /projects/:id/rotate-keys                                      │
│                                                                          │
│  Licenses:                                                               │
│  GET    /projects/:id/licenses                                          │
│  POST   /projects/:id/licenses                                          │
│  GET    /licenses/:id                                                   │
│  PUT    /licenses/:id                                                   │
│  POST   /licenses/:id/suspend                                           │
│  POST   /licenses/:id/revoke                                            │
│  POST   /licenses/:id/reactivate                                        │
│  POST   /licenses/validate          ← SDK endpoint (public)            │
│  POST   /licenses/activate          ← SDK endpoint (public)            │
│                                                                          │
│  Config (Admin):                                                         │
│  GET    /projects/:id/config                                            │
│  PUT    /projects/:id/config                                            │
│  PUT    /projects/:id/maintenance                                       │
│  POST   /projects/:id/killswitch                                        │
│  PUT    /projects/:id/notifications                                     │
│                                                                          │
│  Feature Flags:                                                          │
│  GET    /projects/:id/flags                                             │
│  POST   /projects/:id/flags                                             │
│  PUT    /projects/:id/flags/:flagId                                     │
│  DELETE /projects/:id/flags/:flagId                                     │
│                                                                          │
│  Domains:                                                                │
│  GET    /projects/:id/domains                                           │
│  POST   /projects/:id/domains                                           │
│  POST   /projects/:id/domains/:domainId/verify                         │
│  DELETE /projects/:id/domains/:domainId                                 │
│                                                                          │
│  SDK Endpoints (Public, API-Key Auth):                                  │
│  POST   /sdk/init                                                       │
│  POST   /sdk/validate                                                   │
│  GET    /sdk/config                                                     │
│  POST   /sdk/heartbeat                                                  │
│  POST   /sdk/telemetry                                                  │
│                                                                          │
│  Analytics:                                                              │
│  GET    /analytics/overview                                             │
│  GET    /analytics/licenses                                             │
│  GET    /analytics/usage                                                │
│  GET    /analytics/events                                               │
│                                                                          │
│  Billing:                                                                │
│  GET    /billing/subscription                                           │
│  POST   /billing/subscribe                                              │
│  PUT    /billing/subscription                                           │
│  POST   /billing/cancel                                                 │
│  GET    /billing/invoices                                               │
│  POST   /billing/webhook          ← Stripe webhook                     │
│                                                                          │
│  Webhooks (Outbound Config):                                             │
│  GET    /projects/:id/webhooks                                          │
│  POST   /projects/:id/webhooks                                          │
│  PUT    /projects/:id/webhooks/:whId                                    │
│  DELETE /projects/:id/webhooks/:whId                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 22. Microservices Recommendation

### Service Boundaries (Domain-Driven)

```
┌─────────────────────────────────────────────────────────────────┐
│  Bounded Context          │ Service              │ Owns          │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Identity & Access        │ identity-service     │ users,        │
│                           │                      │ tenants,      │
│                           │                      │ sessions,     │
│                           │                      │ api-keys      │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Licensing                │ license-service      │ licenses,     │
│                           │                      │ activations,  │
│                           │                      │ validations   │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Configuration            │ config-service       │ configs,      │
│                           │                      │ maintenance,  │
│                           │                      │ kill-switch   │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Feature Management       │ feature-flag-service │ flags, rules, │
│                           │                      │ segments      │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Domain Management        │ domain-service       │ domains,      │
│                           │                      │ verifications │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Notifications            │ notification-service │ templates,    │
│                           │                      │ deliveries    │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Analytics & Audit        │ analytics-service    │ events,       │
│                           │                      │ audit-logs,   │
│                           │                      │ reports       │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Billing & Subscription   │ billing-service      │ subscriptions,│
│                           │                      │ invoices,     │
│                           │                      │ usage-meters  │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Real-time Communication  │ websocket-gateway    │ connections,  │
│                           │                      │ rooms,        │
│                           │                      │ broadcasts    │
├───────────────────────────┼──────────────────────┼───────────────┤
│  Background Processing    │ queue-worker         │ job execution │
├───────────────────────────┼──────────────────────┼───────────────┤
│  API Routing              │ api-gateway          │ routing,      │
│                           │                      │ rate-limiting,│
│                           │                      │ auth-verify   │
└───────────────────────────┴──────────────────────┴───────────────┘
```

### Inter-Service Communication

```
Synchronous (HTTP):
  • License validation (latency-critical)
  • Auth verification
  • Config fetch

Asynchronous (Redis Pub/Sub + BullMQ):
  • Event propagation (config changes, license updates)
  • Notification delivery
  • Analytics ingestion
  • Webhook dispatch

Pattern: Event-Carried State Transfer
  • Services publish domain events
  • Consumers maintain local projections
  • Eventual consistency (acceptable for non-critical paths)
```

---

## 23. Monorepo Structure

```
devlock/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, test, build on PR
│   │   ├── deploy-staging.yml        # Deploy to staging on merge
│   │   ├── deploy-production.yml     # Deploy to prod (manual trigger)
│   │   └── sdk-publish.yml           # Publish SDKs to npm
│   └── CODEOWNERS
│
├── apps/
│   ├── dashboard/                    # Next.js Admin Dashboard
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   │   ├── (auth)/           # Auth pages (login, register)
│   │   │   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── licenses/
│   │   │   │   │   ├── config/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── domains/
│   │   │   │   │   ├── billing/
│   │   │   │   │   └── settings/
│   │   │   │   ├── api/              # Next.js API routes (BFF)
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Shared UI components
│   │   │   │   ├── forms/
│   │   │   │   ├── tables/
│   │   │   │   ├── charts/
│   │   │   │   └── layouts/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── stores/              # Zustand stores
│   │   │   └── types/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── gateway/                      # API Gateway (Express)
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rateLimiter.ts
│   │   │   │   ├── tenantContext.ts
│   │   │   │   ├── requestValidator.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   ├── index.ts
│   │   │   │   └── proxy.ts
│   │   │   ├── config/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── license-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── validators/
│   │   │   ├── events/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── config-service/               # Same structure as license-service
│   ├── identity-service/
│   ├── domain-service/
│   ├── notification-service/
│   ├── analytics-service/
│   ├── billing-service/
│   ├── feature-flag-service/
│   ├── websocket-gateway/
│   │   ├── src/
│   │   │   ├── handlers/
│   │   │   ├── middleware/
│   │   │   ├── rooms/
│   │   │   ├── events/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── queue-worker/
│       ├── src/
│       │   ├── processors/
│       │   ├── jobs/
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── sdk-frontend/                 # Frontend SDK (Browser)
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── DevLock.ts       # Main SDK class
│   │   │   │   ├── LicenseManager.ts
│   │   │   │   ├── ConfigManager.ts
│   │   │   │   ├── WebSocketClient.ts
│   │   │   │   ├── DomainVerifier.ts
│   │   │   │   ├── TamperDetector.ts
│   │   │   │   └── OfflineCache.ts
│   │   │   ├── ui/
│   │   │   │   ├── Overlay.ts       # Blocking overlays
│   │   │   │   ├── Banner.ts        # Warning banners
│   │   │   │   └── styles.ts
│   │   │   ├── utils/
│   │   │   │   ├── crypto.ts
│   │   │   │   ├── fingerprint.ts
│   │   │   │   └── storage.ts
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── rollup.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── sdk-backend/                  # Backend SDK (Node.js)
│   │   ├── src/
│   │   │   ├── DevLock.ts
│   │   │   ├── middleware/
│   │   │   │   ├── express.ts       # Express middleware
│   │   │   │   ├── fastify.ts       # Fastify plugin
│   │   │   │   └── generic.ts       # Framework-agnostic
│   │   │   ├── LicenseValidator.ts
│   │   │   ├── ConfigSync.ts
│   │   │   ├── WebSocketClient.ts
│   │   │   └── OfflineValidator.ts
│   │   ├── dist/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                       # Shared types, utils, constants
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── license.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── events.ts
│   │   │   │   ├── tenant.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── db/                           # Mongoose models & migrations
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── schemas/
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── connection.ts
│   │   └── package.json
│   │
│   └── config/                       # Shared configs (ESLint, TS, etc.)
│       ├── eslint/
│       ├── typescript/
│       └── jest/
│
├── docker/
│   ├── docker-compose.yml            # Full local development stack
│   ├── docker-compose.prod.yml       # Production overrides
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── conf.d/
│   │   │   ├── api.conf
│   │   │   ├── dashboard.conf
│   │   │   └── websocket.conf
│   │   └── ssl/
│   └── mongo/
│       └── init-replica.js
│
├── scripts/
│   ├── setup.sh                      # First-time setup
│   ├── seed.ts                       # Database seeding
│   ├── generate-keys.ts             # Ed25519 key generation
│   └── migrate.ts                    # Database migrations
│
├── docs/
│   ├── ARCHITECTURE.md              # This document
│   ├── API.md                       # API documentation
│   ├── SDK-FRONTEND.md              # Frontend SDK docs
│   ├── SDK-BACKEND.md               # Backend SDK docs
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── SECURITY.md                  # Security documentation
│
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root package.json (workspaces)
├── pnpm-workspace.yaml              # pnpm workspace config
├── tsconfig.base.json               # Base TypeScript config
├── .env.example                     # Environment variables template
├── .gitignore
├── .dockerignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 24. CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Trigger: Pull Request                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Stage 1: Validate                                              │    │
│  │  ├── Lint (ESLint + Prettier)                                   │    │
│  │  ├── Type check (tsc --noEmit)                                  │    │
│  │  ├── Dependency audit (npm audit)                               │    │
│  │  └── Commit message validation (Conventional Commits)           │    │
│  │                                                                  │    │
│  │  Stage 2: Test                                                   │    │
│  │  ├── Unit tests (Jest/Vitest, parallel per package)             │    │
│  │  ├── Integration tests (with Docker services)                   │    │
│  │  ├── SDK tests (browser + Node.js)                              │    │
│  │  └── Coverage report (>80% threshold)                           │    │
│  │                                                                  │    │
│  │  Stage 3: Build                                                  │    │
│  │  ├── Build all packages (Turborepo, cached)                     │    │
│  │  ├── Build Docker images (multi-stage)                          │    │
│  │  └── Build SDK bundles (Rollup)                                 │    │
│  │                                                                  │    │
│  │  Stage 4: Security                                               │    │
│  │  ├── SAST scan (CodeQL / Semgrep)                               │    │
│  │  ├── Container scan (Trivy)                                     │    │
│  │  ├── Secret detection (TruffleHog)                              │    │
│  │  └── License compliance check                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Trigger: Merge to main                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Stage 5: Deploy Staging                                         │    │
│  │  ├── Push images to registry (tagged: sha-xxxxx)                │    │
│  │  ├── Deploy to staging cluster                                  │    │
│  │  ├── Run smoke tests against staging                            │    │
│  │  ├── Run E2E tests (Playwright)                                 │    │
│  │  └── Performance benchmark (k6)                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Trigger: Manual approval / Release tag                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Stage 6: Deploy Production                                      │    │
│  │  ├── Blue-green deployment                                      │    │
│  │  ├── Canary release (10% → 50% → 100%)                        │    │
│  │  ├── Health check validation                                    │    │
│  │  ├── Automatic rollback on failure                              │    │
│  │  └── Post-deploy smoke tests                                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Trigger: SDK version tag (v*.*.*)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Stage 7: SDK Publish                                            │    │
│  │  ├── Build SDK bundles                                          │    │
│  │  ├── Generate API docs                                          │    │
│  │  ├── Publish to npm (@devlock/sdk-frontend, @devlock/sdk-node)  │    │
│  │  ├── Upload to CDN (versioned: cdn.devlock.io/sdk/v1.2.3.js)   │    │
│  │  └── Update documentation site                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Turborepo Pipeline Configuration

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

---

## 25. Observability Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Metrics (Prometheus + Grafana):                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  System Metrics:                                                 │    │
│  │  • CPU, memory, disk, network per container                     │    │
│  │  • Node.js event loop lag, heap usage, GC pauses                │    │
│  │                                                                  │    │
│  │  Application Metrics:                                            │    │
│  │  • Request rate, latency (p50, p95, p99), error rate            │    │
│  │  • License validations/sec                                      │    │
│  │  • WebSocket connections (current, peak)                        │    │
│  │  • Cache hit/miss ratio                                         │    │
│  │  • Queue depth, processing time                                 │    │
│  │                                                                  │    │
│  │  Business Metrics:                                               │    │
│  │  • Active licenses by tenant                                    │    │
│  │  • SDK init success/failure rate                                │    │
│  │  • Kill-switch activations                                      │    │
│  │  • Domain verification failures                                 │    │
│  │  • Tamper detection events                                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Logging (Structured JSON → ELK/Loki):                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Format: JSON (pino/winston)                                    │    │
│  │  Fields: timestamp, level, service, tenantId, requestId,        │    │
│  │          traceId, message, metadata                             │    │
│  │  Levels: error, warn, info, debug                               │    │
│  │  Retention: 30 days hot, 90 days warm, 1 year cold             │    │
│  │  PII: Redacted in logs (email → e***@***.com)                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Tracing (OpenTelemetry → Jaeger/Tempo):                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  • Distributed tracing across all services                      │    │
│  │  • Trace ID propagation via headers                             │    │
│  │  • Span attributes: tenantId, projectId, licenseId             │    │
│  │  • Sampling: 100% errors, 10% success (adjustable)             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Alerting:                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Critical (PagerDuty):                                          │    │
│  │  • Error rate > 5% for 2 minutes                                │    │
│  │  • P99 latency > 2s for 5 minutes                              │    │
│  │  • WebSocket disconnection spike > 20%                          │    │
│  │  • MongoDB replication lag > 10s                                │    │
│  │                                                                  │    │
│  │  Warning (Slack):                                                │    │
│  │  • Cache hit rate < 80%                                         │    │
│  │  • Queue depth > 500 for 5 minutes                              │    │
│  │  • Disk usage > 80%                                             │    │
│  │  • Certificate expiry < 14 days                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Health Checks:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  GET /health         → { status: 'ok', uptime, version }       │    │
│  │  GET /health/ready   → Checks DB, Redis, dependencies          │    │
│  │  GET /health/live    → Simple liveness (process alive)          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 26. SaaS Subscription System

### Plan Tiers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION PLANS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┬──────────────┬──────────────┬──────────────────┐      │
│  │   Feature   │     Free     │     Pro      │   Enterprise     │      │
│  ├─────────────┼──────────────┼──────────────┼──────────────────┤      │
│  │ Projects    │      2       │     20       │   Unlimited      │      │
│  │ Licenses    │     50       │   5,000      │   Unlimited      │      │
│  │ API Calls   │   10K/mo     │  500K/mo     │   Unlimited      │      │
│  │ Team Members│      2       │     10       │   Unlimited      │      │
│  │ Domains     │      2       │     20       │   Unlimited      │      │
│  │ WebSocket   │     ✗        │      ✓       │       ✓          │      │
│  │ Kill-Switch │     ✗        │      ✓       │       ✓          │      │
│  │ Feature Flags│    5        │     50       │   Unlimited      │      │
│  │ Analytics   │   7 days     │   90 days    │   1 year         │      │
│  │ Audit Log   │     ✗        │   30 days    │   1 year         │      │
│  │ Custom Domain│    ✗        │      ✗       │       ✓          │      │
│  │ SSO/SAML    │     ✗        │      ✗       │       ✓          │      │
│  │ SLA         │     ✗        │   99.9%      │   99.99%         │      │
│  │ Support     │  Community   │    Email     │   Dedicated      │      │
│  │ Offline Grace│  24 hours   │   72 hours   │   7 days         │      │
│  │ Webhooks    │     ✗        │      ✓       │       ✓          │      │
│  │ White-label │     ✗        │      ✗       │       ✓          │      │
│  ├─────────────┼──────────────┼──────────────┼──────────────────┤      │
│  │ Price       │    $0/mo     │   $49/mo     │   Custom         │      │
│  └─────────────┴──────────────┴──────────────┴──────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Billing Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Payment Provider: Stripe                                        │
│                                                                  │
│  Integration Points:                                             │
│  • Stripe Checkout for subscription creation                    │
│  • Stripe Billing Portal for self-service management            │
│  • Stripe Webhooks for event processing                         │
│  • Stripe Metered Billing for usage-based charges               │
│                                                                  │
│  Webhook Events Handled:                                         │
│  • customer.subscription.created → Activate tenant plan         │
│  • customer.subscription.updated → Update limits                │
│  • customer.subscription.deleted → Downgrade to free            │
│  • invoice.payment_failed → Show payment warning via SDK        │
│  • invoice.paid → Clear payment warnings                        │
│                                                                  │
│  Usage Metering:                                                 │
│  • API calls counted per billing period                         │
│  • Overage charges for exceeding plan limits                    │
│  • Usage snapshots every hour → Stripe usage records            │
│                                                                  │
│  Dunning Flow:                                                   │
│  1. Payment fails → Retry 3x over 7 days                       │
│  2. After 7 days → SDK shows payment warning to end-users       │
│  3. After 14 days → Downgrade to free plan limits              │
│  4. After 30 days → Suspend all licenses (recoverable)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 27. Production Best Practices

### Reliability

- **Circuit Breakers**: Implement circuit breakers on all inter-service calls (opossum library). Open after 5 consecutive failures, half-open after 30s.
- **Graceful Degradation**: If license service is down, SDKs fall back to cached state + offline validation. Never hard-fail the client application.
- **Connection Pooling**: MongoDB connection pool (min: 5, max: 50 per service). Redis connection pool via ioredis cluster mode.
- **Retry with Backoff**: All external calls use exponential backoff (base: 100ms, max: 30s, jitter: ±20%).
- **Idempotency**: All mutation endpoints accept idempotency keys. Stored in Redis with 24h TTL.
- **Graceful Shutdown**: SIGTERM handler drains connections (30s timeout), completes in-flight requests, closes DB connections.

### Performance

- **Response Time Targets**: SDK endpoints < 50ms (p95), Dashboard API < 200ms (p95).
- **Database Optimization**: Compound indexes on all query patterns. Covered queries for hot paths. Read preference: secondaryPreferred for analytics.
- **Payload Optimization**: gzip compression for all responses > 1KB. Binary protocol for WebSocket messages. Minimal SDK payload (tree-shaken, < 15KB gzipped).
- **Connection Reuse**: HTTP/2 for inter-service communication. Keep-alive connections to MongoDB and Redis.
- **Batch Operations**: SDK telemetry batched (max 50 events or 30s interval). Analytics writes batched via BullMQ.

### Data Integrity

- **Atomic Operations**: MongoDB transactions for multi-document updates. Redis Lua scripts for atomic cache operations.
- **Versioned Configs**: Monotonic version numbers prevent out-of-order updates. Optimistic concurrency control.
- **Backup Strategy**: MongoDB: Continuous backup with point-in-time recovery (PITR). Redis: RDB snapshots every 15min + AOF. Retention: 30 days.
- **Data Validation**: Zod schemas at API boundaries. Mongoose schema validation at DB layer. Double validation (never trust client).

### Operational

- **Feature Flags (Internal)**: Use DevLock's own feature flag system for platform features. Dogfooding.
- **Database Migrations**: Forward-only migrations. Backward-compatible schema changes. Blue-green compatible.
- **Secret Management**: External KMS (AWS KMS / HashiCorp Vault). No secrets in code or environment variables in production.
- **Dependency Management**: Renovate bot for automated updates. Lock files committed. Security patches auto-merged.

---

## 28. Enterprise Security Recommendations

### Infrastructure Security

| Layer | Recommendation |
|-------|---------------|
| Network | VPC with private subnets for services. Public subnet only for load balancer. |
| Encryption | TLS 1.3 everywhere. AES-256-GCM at rest. Ed25519 for signatures. |
| Access | Zero-trust network. Service mesh with mTLS. No SSH in production. |
| Secrets | External KMS with automatic rotation. Envelope encryption for tenant data. |
| Containers | Distroless base images. Non-root users. Read-only filesystems. |
| Dependencies | SCA scanning in CI. SBOM generation. Automated CVE patching. |

### Application Security

| Area | Implementation |
|------|---------------|
| Authentication | Argon2id for password hashing. TOTP-based MFA. Session binding to IP+UA. |
| Authorization | RBAC with least-privilege defaults. Permission checks at service layer. |
| Input Validation | Zod schemas on all inputs. Parameterized queries. Output encoding. |
| API Security | HMAC request signing. Timestamp validation. Replay protection via nonce. |
| SDK Security | Code integrity verification. Anti-debugging (optional). Obfuscation (optional). |
| Data Protection | PII encryption at field level. Audit logging for all data access. GDPR compliance. |

### Compliance Readiness

```
SOC 2 Type II:
  • Audit logging (immutable, append-only)
  • Access controls (RBAC, MFA)
  • Encryption (at rest + in transit)
  • Incident response procedures
  • Change management (CI/CD audit trail)

GDPR:
  • Data processing agreements
  • Right to erasure (tenant data deletion pipeline)
  • Data export (machine-readable format)
  • Data residency options (EU/US/APAC regions)
  • Privacy by design (minimal data collection)

ISO 27001:
  • Information security management system (ISMS)
  • Risk assessment and treatment
  • Security controls documentation
  • Regular security audits and penetration testing
```

### Incident Response

```
Severity Levels:
  SEV1: Platform-wide outage, data breach → 15min response, all-hands
  SEV2: Service degradation, partial outage → 30min response, on-call team
  SEV3: Non-critical issue, single tenant → 4h response, engineering team
  SEV4: Minor bug, cosmetic issue → Next business day

Runbooks:
  • Database failover procedure
  • Redis cluster recovery
  • WebSocket mass-reconnection handling
  • Kill-switch false-positive recovery
  • Compromised API key rotation
  • DDoS mitigation escalation
```

---

## Summary

DevLock is designed as a horizontally-scalable, event-driven platform with real-time capabilities at its core. The architecture prioritizes:

1. **Sub-second propagation** from admin action to SDK enforcement
2. **Offline resilience** through cryptographic license tokens
3. **Tenant isolation** without sacrificing infrastructure efficiency
4. **Defense-in-depth** security across every layer
5. **Operational excellence** through comprehensive observability

The monorepo structure with Turborepo enables rapid development while maintaining clear service boundaries. The SDK-first design ensures that the platform's value is delivered with minimal integration effort for developers.

---

*Document Version: 1.0.0*
*Last Updated: 2026-05-24*
*Classification: Internal — Engineering*
