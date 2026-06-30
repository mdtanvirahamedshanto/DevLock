// Standard API response wrappers

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// SDK Init/Config response
export interface SDKInitResponse {
  projectId: string;
  config: {
    maintenance: { enabled: boolean; message?: string };
    killSwitch: { enabled: boolean };
    notifications: Array<{
      id: string;
      type: string;
      message: string;
      severity: string;
      dismissible: boolean;
    }>;
    featureFlags: Record<string, boolean>;
    domainLock: { enabled: boolean; action: string };
  };
  license?: {
    valid: boolean;
    status: string;
    features: string[];
    expiresAt?: string;
  };
  wsEndpoint: string;
  serverTime: number;
  offlineToken?: string;
}

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  timestamp: number;
  checks?: Record<string, { status: string; latency?: number }>;
}
