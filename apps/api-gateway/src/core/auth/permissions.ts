export type Role = 'owner' | 'admin' | 'developer' | 'viewer' | 'billing';

export type Permission =
  | 'org:read'
  | 'org:update'
  | 'org:delete'
  | 'org:manage_members'
  | 'org:manage_billing'
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:rotate_keys'
  | 'license:create'
  | 'license:read'
  | 'license:update'
  | 'license:suspend'
  | 'license:revoke'
  | 'config:read'
  | 'config:update'
  | 'killswitch:activate'
  | 'analytics:read'
  | 'audit:read'
  | 'audit:export'
  | 'webhook:manage';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'org:read', 'org:update', 'org:delete', 'org:manage_members', 'org:manage_billing',
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:rotate_keys',
    'license:create', 'license:read', 'license:update', 'license:suspend', 'license:revoke',
    'config:read', 'config:update', 'killswitch:activate',
    'analytics:read', 'audit:read', 'audit:export', 'webhook:manage',
  ],
  admin: [
    'org:read', 'org:update', 'org:manage_members', 'org:manage_billing',
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:rotate_keys',
    'license:create', 'license:read', 'license:update', 'license:suspend', 'license:revoke',
    'config:read', 'config:update', 'killswitch:activate',
    'analytics:read', 'audit:read', 'audit:export', 'webhook:manage',
  ],
  developer: [
    'org:read',
    'project:create', 'project:read', 'project:update',
    'license:create', 'license:read', 'license:update', 'license:suspend',
    'config:read', 'config:update',
    'analytics:read', 'webhook:manage',
  ],
  viewer: [
    'org:read',
    'project:read',
    'license:read',
    'config:read',
    'analytics:read',
  ],
  billing: [
    'org:read', 'org:manage_billing',
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
