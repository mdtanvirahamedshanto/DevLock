# DevLock — Dashboard Architecture Blueprint

> Production-grade SaaS admin dashboard built with Next.js App Router, TypeScript, Tailwind CSS, and Shadcn UI.

---

## Table of Contents

1. [App Router Architecture](#1-app-router-architecture)
2. [Folder Structure](#2-folder-structure)
3. [State Management](#3-state-management)
4. [API Layer](#4-api-layer)
5. [Authentication Flow](#5-authentication-flow)
6. [RBAC System](#6-rbac-system)
7. [Real-Time Architecture](#7-real-time-architecture)
8. [Dashboard Layout](#8-dashboard-layout)
9. [Table Architecture](#9-table-architecture)
10. [Form Architecture](#10-form-architecture)
11. [Error Boundaries](#11-error-boundaries)
12. [Loading & Suspense](#12-loading--suspense)
13. [Data Fetching Strategy](#13-data-fetching-strategy)
14. [Server Actions](#14-server-actions)
15. [Edge Middleware](#15-edge-middleware)
16. [Theme System](#16-theme-system)
17. [Component Architecture](#17-component-architecture)
18. [Design System](#18-design-system)
19. [Accessibility](#19-accessibility)
20. [Responsive System](#20-responsive-system)
21. [Performance Optimization](#21-performance-optimization)
22. [Production Deployment](#22-production-deployment)

---

## 1. App Router Architecture

### Route Groups & Segments

```
app/
├── (auth)/                    → Public auth pages (no sidebar)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── layout.tsx             → Centered card layout
│
├── (dashboard)/               → Protected dashboard (sidebar + header)
│   ├── layout.tsx             → Dashboard shell with sidebar
│   ├── page.tsx               → Dashboard overview/home
│   ├── projects/
│   │   ├── page.tsx           → Project list
│   │   ├── new/page.tsx       → Create project
│   │   └── [projectId]/
│   │       ├── layout.tsx     → Project-scoped layout (tabs)
│   │       ├── page.tsx       → Project overview
│   │       ├── licenses/
│   │       │   ├── page.tsx   → License table
│   │       │   ├── new/page.tsx
│   │       │   └── [licenseId]/page.tsx
│   │       ├── config/page.tsx
│   │       ├── flags/page.tsx
│   │       ├── domains/page.tsx
│   │       ├── devices/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── webhooks/page.tsx
│   │       └── settings/page.tsx
│   ├── organization/
│   │   ├── page.tsx           → Org settings
│   │   ├── members/page.tsx
│   │   ├── teams/page.tsx
│   │   └── billing/page.tsx
│   ├── notifications/page.tsx
│   ├── audit-logs/page.tsx
│   └── settings/page.tsx      → User settings
│
├── api/                       → API routes (BFF pattern)
│   └── auth/[...nextauth]/route.ts
│
├── layout.tsx                 → Root layout (providers)
├── not-found.tsx
├── error.tsx
└── loading.tsx
```

### Parallel & Intercepting Routes

```
(dashboard)/projects/[projectId]/
├── @modal/                    → Intercepting modal routes
│   └── licenses/[licenseId]/page.tsx  → License detail modal
├── layout.tsx                 → Renders {children} + {modal}
```

---

## 2. Folder Structure

```
apps/web-dashboard/
├── src/
│   ├── app/                       → Next.js App Router pages
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/                → UI Components
│   │   ├── ui/                    → Shadcn primitives (button, input, etc.)
│   │   ├── layout/                → Shell, sidebar, header, nav
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── org-switcher.tsx
│   │   │   └── user-menu.tsx
│   │   ├── data/                  → Data display (tables, cards, stats)
│   │   │   ├── data-table.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── empty-state.tsx
│   │   ├── forms/                 → Form components
│   │   │   ├── license-form.tsx
│   │   │   ├── project-form.tsx
│   │   │   └── domain-form.tsx
│   │   ├── feedback/              → Toasts, alerts, modals
│   │   │   ├── toast.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   └── error-boundary.tsx
│   │   └── shared/                → Cross-cutting components
│   │       ├── page-header.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── status-badge.tsx
│   │
│   ├── hooks/                     → Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-permissions.ts
│   │   ├── use-realtime.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── lib/                       → Utilities & configuration
│   │   ├── api-client.ts          → Fetch wrapper with auth
│   │   ├── socket.ts             → Socket.IO client singleton
│   │   ├── utils.ts              → cn(), formatDate(), etc.
│   │   ├── constants.ts
│   │   └── validations.ts        → Shared Zod schemas
│   │
│   ├── stores/                    → Zustand stores
│   │   ├── auth-store.ts
│   │   ├── org-store.ts
│   │   ├── notification-store.ts
│   │   └── realtime-store.ts
│   │
│   ├── services/                  → API service layer
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── license.service.ts
│   │   ├── config.service.ts
│   │   ├── analytics.service.ts
│   │   ├── billing.service.ts
│   │   └── notification.service.ts
│   │
│   ├── providers/                 → React context providers
│   │   ├── query-provider.tsx     → React Query
│   │   ├── theme-provider.tsx
│   │   ├── auth-provider.tsx
│   │   ├── socket-provider.tsx
│   │   └── toast-provider.tsx
│   │
│   ├── types/                     → Dashboard-specific types
│   │   └── index.ts
│   │
│   └── middleware.ts              → Next.js Edge Middleware
│
├── public/
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## 3. State Management

### Zustand Stores (Client State)

```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: { id: string; name: string; email: string; role: string } | null;
  setAuth: (token: string, user: AuthState['user']) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    { name: 'devlock-auth', partialize: (state) => ({ user: state.user }) }
  )
);
```

```typescript
// stores/org-store.ts
import { create } from 'zustand';

interface OrgState {
  currentOrg: { id: string; name: string; plan: string } | null;
  organizations: Array<{ id: string; name: string; plan: string }>;
  setCurrentOrg: (org: OrgState['currentOrg']) => void;
  setOrganizations: (orgs: OrgState['organizations']) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  organizations: [],
  setCurrentOrg: (org) => set({ currentOrg: org }),
  setOrganizations: (orgs) => set({ organizations: orgs }),
}));
```

```typescript
// stores/realtime-store.ts
import { create } from 'zustand';

interface RealtimeEvent {
  id: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface RealtimeState {
  connected: boolean;
  events: RealtimeEvent[];
  setConnected: (connected: boolean) => void;
  addEvent: (event: RealtimeEvent) => void;
  clearEvents: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  events: [],
  setConnected: (connected) => set({ connected }),
  addEvent: (event) => set((s) => ({ events: [event, ...s.events].slice(0, 100) })),
  clearEvents: () => set({ events: [] }),
}));
```

### React Query (Server State)

```typescript
// React Query handles all server state:
// - Caching, deduplication, background refetch
// - Optimistic updates
// - Pagination, infinite scroll
// - Mutation with cache invalidation

// Example: License list query
const { data, isLoading } = useQuery({
  queryKey: ['licenses', projectId, filters],
  queryFn: () => licenseService.list(projectId, filters),
  staleTime: 30_000,        // 30s before refetch
  refetchOnWindowFocus: true,
});
```

---

## 4. API Layer

### API Client (Fetch Wrapper)

```typescript
// lib/api-client.ts
import { useAuthStore } from '@/stores/auth-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private getToken(): string | null {
    return useAuthStore.getState().accessToken;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    };

    const response = await fetch(url, { ...fetchOptions, headers });

    if (response.status === 401) {
      // Token expired — attempt refresh or logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.error?.message ?? 'Request failed', error.error?.code);
    }

    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}
```

### Service Layer Example

```typescript
// services/license.service.ts
import { api } from '@/lib/api-client';

export interface License {
  id: string;
  status: string;
  type: string;
  key?: string;
  maxActivations: number;
  currentActivations: number;
  features: string[];
  customerEmail?: string;
  expiresAt?: string;
  createdAt: string;
}

export const licenseService = {
  list: (projectId: string, params?: Record<string, string>) =>
    api.get<{ success: boolean; data: License[]; meta: PaginationMeta }>(
      `/projects/${projectId}/licenses`, params
    ),

  getById: (projectId: string, licenseId: string) =>
    api.get<{ success: boolean; data: License }>(
      `/projects/${projectId}/licenses/${licenseId}`
    ),

  create: (projectId: string, data: CreateLicenseInput) =>
    api.post<{ success: boolean; data: License }>(
      `/projects/${projectId}/licenses`, data
    ),

  suspend: (projectId: string, licenseId: string, reason: string) =>
    api.post(`/projects/${projectId}/licenses/${licenseId}/suspend`, { reason }),

  revoke: (projectId: string, licenseId: string) =>
    api.post(`/projects/${projectId}/licenses/${licenseId}/revoke`),

  reactivate: (projectId: string, licenseId: string) =>
    api.post(`/projects/${projectId}/licenses/${licenseId}/reactivate`),
};
```

---

## 5. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User visits /login                                           │
│  2. Submits email + password                                     │
│  3. POST /v1/auth/login → { accessToken, refreshToken }         │
│  4. Store accessToken in Zustand (memory)                        │
│  5. Store refreshToken in httpOnly cookie (via BFF)              │
│  6. Redirect to /dashboard                                       │
│  7. Edge middleware checks cookie on every request               │
│  8. On 401 → attempt refresh → retry or redirect to /login      │
└─────────────────────────────────────────────────────────────────┘
```

```typescript
// providers/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Listen for auth errors across tabs
    const handler = (e: StorageEvent) => {
      if (e.key === 'devlock-auth' && !e.newValue) {
        logout();
        router.push('/login');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [logout, router]);

  return <>{children}</>;
}
```

---

## 6. RBAC System

```typescript
// hooks/use-permissions.ts
'use client';

import { useAuthStore } from '@/stores/auth-store';

type Permission = 'license:create' | 'license:suspend' | 'config:update'
  | 'killswitch:activate' | 'org:manage_members' | 'audit:read' | string;

export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role ?? 'viewer';

  const can = (permission: Permission): boolean => {
    // Permissions are included in the JWT and stored in auth state
    return useAuthStore.getState().user?.permissions?.includes(permission) ?? false;
  };

  const canAny = (...permissions: Permission[]): boolean => {
    return permissions.some(can);
  };

  const canAll = (...permissions: Permission[]): boolean => {
    return permissions.every(can);
  };

  return { can, canAny, canAll, role };
}
```

```tsx
// Usage in components:
function LicenseActions({ license }) {
  const { can } = usePermissions();

  return (
    <div>
      {can('license:suspend') && (
        <Button onClick={() => suspend(license.id)}>Suspend</Button>
      )}
      {can('license:revoke') && (
        <Button variant="destructive" onClick={() => revoke(license.id)}>Revoke</Button>
      )}
    </div>
  );
}
```

```tsx
// components/shared/permission-gate.tsx
export function PermissionGate({
  permission, children, fallback = null
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
```

---

## 7. Real-Time Architecture

```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3010', {
      auth: { token: useAuthStore.getState().accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
```

```typescript
// hooks/use-realtime.ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useRealtimeStore } from '@/stores/realtime-store';

export function useRealtime(projectId: string) {
  const queryClient = useQueryClient();
  const { setConnected, addEvent } = useRealtimeStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Listen for project-scoped events
    socket.on('license:suspended', (data) => {
      addEvent({ id: data.eventId, event: 'license:suspended', data, timestamp: Date.now() });
      queryClient.invalidateQueries({ queryKey: ['licenses', projectId] });
    });

    socket.on('config:updated', (data) => {
      addEvent({ id: data.eventId, event: 'config:updated', data, timestamp: Date.now() });
      queryClient.invalidateQueries({ queryKey: ['config', projectId] });
    });

    socket.on('killswitch:activated', (data) => {
      addEvent({ id: data.eventId, event: 'killswitch:activated', data, timestamp: Date.now() });
      queryClient.invalidateQueries({ queryKey: ['config', projectId] });
    });

    socket.on('maintenance:enabled', (data) => {
      addEvent({ id: data.eventId, event: 'maintenance:enabled', data, timestamp: Date.now() });
    });

    return () => {
      socket.off('license:suspended');
      socket.off('config:updated');
      socket.off('killswitch:activated');
      socket.off('maintenance:enabled');
    };
  }, [projectId, queryClient, setConnected, addEvent]);
}
```

---

## 8. Dashboard Layout

```tsx
// components/layout/dashboard-shell.tsx
'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        collapsed={!sidebarOpen && !isMobile}
      />
      <div className={cn('flex flex-1 flex-col overflow-hidden',
        sidebarOpen && !isMobile ? 'ml-64' : 'ml-16'
      )}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx
// components/layout/sidebar.tsx
const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText, permission: 'audit:read' },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Organization', href: '/organization', icon: Building2 },
  { name: 'Billing', href: '/organization/billing', icon: CreditCard, permission: 'org:manage_billing' },
  { name: 'Settings', href: '/settings', icon: Settings },
];
```

---

## 9. Table Architecture

```tsx
// components/data/data-table.tsx
'use client';

import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender,
  type ColumnDef, type SortingState, type ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns, data, totalCount, pageSize, currentPage,
  onPageChange, onSearch, isLoading, toolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  return (
    <div className="space-y-4">
      {toolbar}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-10">No results</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={onPageChange}
      />
    </div>
  );
}
```

---

## 10. Form Architecture

```tsx
// React Hook Form + Zod for all forms
// components/forms/license-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { licenseService } from '@/services/license.service';
import { toast } from 'sonner';

const schema = z.object({
  type: z.enum(['perpetual', 'subscription', 'trial', 'floating']),
  maxActivations: z.number().min(1).max(10000),
  expiresAt: z.string().optional(),
  features: z.array(z.string()).default([]),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LicenseForm({ projectId, onSuccess }: { projectId: string; onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'subscription', maxActivations: 1, features: [] },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => licenseService.create(projectId, data),
    onSuccess: (result) => {
      toast.success('License created', { description: `Key: ${result.data.key}` });
      queryClient.invalidateQueries({ queryKey: ['licenses', projectId] });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error('Failed to create license', { description: err.message });
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {/* Form fields using Shadcn Form components */}
      <FormField control={form.control} name="type" render={({ field }) => (
        <FormItem>
          <FormLabel>License Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="perpetual">Perpetual</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="floating">Floating</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      {/* ... more fields */}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create License'}
      </Button>
    </form>
  );
}
```

---

## 11. Error Boundaries

```tsx
// components/feedback/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground mt-2 mb-4">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

```tsx
// app/(dashboard)/projects/[projectId]/error.tsx (Next.js file-based error boundary)
'use client';

export default function ProjectError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-bold">Failed to load project</h2>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <Button onClick={reset} className="mt-4">Retry</Button>
    </div>
  );
}
```

---

## 12. Loading & Suspense

```tsx
// app/(dashboard)/projects/[projectId]/licenses/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function LicensesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

```tsx
// Streaming with Suspense boundaries
// app/(dashboard)/projects/[projectId]/page.tsx
import { Suspense } from 'react';
import { ProjectOverview } from './project-overview';
import { RecentActivity } from './recent-activity';
import { StatsSkeleton, ActivitySkeleton } from './skeletons';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<StatsSkeleton />}>
        <ProjectOverview projectId={params.projectId} />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity projectId={params.projectId} />
      </Suspense>
    </div>
  );
}
```

---

## 13. Data Fetching Strategy

| Pattern | When to Use | Example |
|---------|-------------|---------|
| Server Component fetch | Static/SSR data, SEO pages | Project list page |
| React Query (client) | Interactive data, real-time updates | License table with filters |
| Server Actions | Mutations from forms | Create license, update config |
| SWR-like polling | Near-real-time without WebSocket | Analytics dashboard |
| WebSocket | Instant updates | Kill-switch status, live events |

```tsx
// Server Component data fetching (no client JS)
// app/(dashboard)/projects/page.tsx
import { api } from '@/lib/api-server'; // Server-side API client

export default async function ProjectsPage() {
  const { data: projects } = await api.get('/projects');

  return (
    <div>
      <h1>Projects</h1>
      {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
    </div>
  );
}
```

```tsx
// Client Component with React Query (interactive)
// app/(dashboard)/projects/[projectId]/licenses/license-table.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { licenseService } from '@/services/license.service';
import { DataTable } from '@/components/data/data-table';
import { columns } from './columns';
import { useState } from 'react';

export function LicenseTable({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>();

  const { data, isLoading } = useQuery({
    queryKey: ['licenses', projectId, { page, status }],
    queryFn: () => licenseService.list(projectId, {
      page: String(page), limit: '20', ...(status ? { status } : {}),
    }),
  });

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      totalCount={data?.meta?.total ?? 0}
      pageSize={20}
      currentPage={page}
      onPageChange={setPage}
      isLoading={isLoading}
    />
  );
}
```

---

## 14. Server Actions

```typescript
// app/(dashboard)/projects/[projectId]/config/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function toggleMaintenance(projectId: string, enabled: boolean, message?: string) {
  const token = cookies().get('access_token')?.value;

  const res = await fetch(`${process.env.API_URL}/v1/projects/${projectId}/maintenance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled, message }),
  });

  if (!res.ok) throw new Error('Failed to update maintenance mode');

  revalidatePath(`/projects/${projectId}/config`);
  return { success: true };
}

export async function activateKillSwitch(projectId: string, reason: string) {
  const token = cookies().get('access_token')?.value;

  const res = await fetch(`${process.env.API_URL}/v1/projects/${projectId}/kill-switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled: true, reason }),
  });

  if (!res.ok) throw new Error('Failed to activate kill switch');

  revalidatePath(`/projects/${projectId}/config`);
  return { success: true };
}
```

---

## 15. Edge Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token is not expired (basic check without full verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!));
    if (payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 16. Theme System

```typescript
// providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
```

```css
/* CSS variables for theming (globals.css) */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --destructive: 0 84.2% 60.2%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
    --sidebar-width: 16rem;
    --sidebar-collapsed: 4rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 217.2 32.6% 8%;
    --primary: 217.2 91.2% 59.8%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
  }
}
```
