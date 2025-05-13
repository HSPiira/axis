
export const USER_PERMISSIONS = {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    IMPERSONATE: 'user:impersonate',
    EXPORT: 'user:export',
    IMPORT: 'user:import',
    SUSPEND: 'user:suspend',
    REACTIVATE: 'user:reactivate',
} as const;

export const DOCUMENT_PERMISSIONS = {
    CREATE: 'document:create',
    READ: 'document:read',
    UPDATE: 'document:update',
    DELETE: 'document:delete',
    SHARE: 'document:share',
    VERSION: 'document:version',
    APPROVE: 'document:approve',
    REJECT: 'document:reject',
} as const;


// Then flatten all permissions for enums/types/etc.
export const PERMISSIONS = {
    ...USER_PERMISSIONS,
    ...DOCUMENT_PERMISSIONS,
    // ...ORGANIZATION_PERMISSIONS,
    // ...INDUSTRY_PERMISSIONS,
    // Add other groups here...
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];