export const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    MANAGER: 'manager',
    VIEWER: 'viewer',
    SUPPORT: 'support',
    AUDITOR: 'auditor',
} as const;

// Generic permission factory
export const createResourcePermissions = (resource: string) => ({
    CREATE: `${resource}:create`,
    READ: `${resource}:read`,
    UPDATE: `${resource}:update`,
    DELETE: `${resource}:delete`,
    ASSIGN: `${resource}:assign`,
    IMPORT: `${resource}:import`,
    EXPORT: `${resource}:export`,
} as const);

// Resource-specific permissions
export const ORGANIZATION_PERMISSIONS = createResourcePermissions('organization');
export const INDUSTRY_PERMISSIONS = {
    ...createResourcePermissions('industry'),
    HIERARCHY: 'industry:hierarchy',
} as const;

// Define the type for all permissions
export type Permission =
    | typeof ORGANIZATION_PERMISSIONS[keyof typeof ORGANIZATION_PERMISSIONS]
    | typeof INDUSTRY_PERMISSIONS[keyof typeof INDUSTRY_PERMISSIONS]
    | 'user:create'
    | 'user:read'
    | 'user:update'
    | 'user:delete'
    | 'user:impersonate'
    | 'user:export'
    | 'user:import'
    | 'user:suspend'
    | 'user:reactivate'
    | 'role:create'
    | 'role:read'
    | 'role:update'
    | 'role:delete'
    | 'role:assign'
    | 'role:revoke'
    | 'permission:create'
    | 'permission:read'
    | 'permission:update'
    | 'permission:delete'
    | 'permission:assign'
    | 'staff:access'
    | 'staff:manage'
    | 'staff:approve'
    | 'document:create'
    | 'document:read'
    | 'document:update'
    | 'document:delete'
    | 'document:share'
    | 'document:version'
    | 'document:approve'
    | 'document:reject';

export const PERMISSIONS: Record<string, Permission> = {
    // User management
    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_IMPERSONATE: 'user:impersonate',
    USER_EXPORT: 'user:export',
    USER_IMPORT: 'user:import',
    USER_SUSPEND: 'user:suspend',
    USER_REACTIVATE: 'user:reactivate',

    // Organization management
    ...ORGANIZATION_PERMISSIONS,

    // Role management
    ROLE_CREATE: 'role:create',
    ROLE_READ: 'role:read',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',
    ROLE_ASSIGN: 'role:assign',
    ROLE_REVOKE: 'role:revoke',

    // Permission management
    PERMISSION_CREATE: 'permission:create',
    PERMISSION_READ: 'permission:read',
    PERMISSION_UPDATE: 'permission:update',
    PERMISSION_DELETE: 'permission:delete',
    PERMISSION_ASSIGN: 'permission:assign',

    // Staff permissions
    STAFF_ACCESS: 'staff:access',
    STAFF_MANAGE: 'staff:manage',
    STAFF_APPROVE: 'staff:approve',

    // Industry management
    ...INDUSTRY_PERMISSIONS,

    // Document management
    DOCUMENT_CREATE: 'document:create',
    DOCUMENT_READ: 'document:read',
    DOCUMENT_UPDATE: 'document:update',
    DOCUMENT_DELETE: 'document:delete',
    DOCUMENT_SHARE: 'document:share',
    DOCUMENT_VERSION: 'document:version',
    DOCUMENT_APPROVE: 'document:approve',
    DOCUMENT_REJECT: 'document:reject'
};

// Role permission mappings
export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions
    [ROLES.MANAGER]: [
        // User management
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.USER_EXPORT,
        PERMISSIONS.USER_SUSPEND,
        PERMISSIONS.USER_REACTIVATE,
        // Organization management
        PERMISSIONS.ORGANIZATION_CREATE,
        PERMISSIONS.ORGANIZATION_READ,
        PERMISSIONS.ORGANIZATION_UPDATE,
        PERMISSIONS.ORGANIZATION_EXPORT,
        PERMISSIONS.ORGANIZATION_IMPORT,
        PERMISSIONS.ORGANIZATION_ASSIGN,
        // Role management
        PERMISSIONS.ROLE_READ,
        PERMISSIONS.ROLE_ASSIGN,
        PERMISSIONS.ROLE_REVOKE,
        // Permission management
        PERMISSIONS.PERMISSION_READ,
        // Staff permissions
        PERMISSIONS.STAFF_ACCESS,
        PERMISSIONS.STAFF_MANAGE,
        PERMISSIONS.STAFF_APPROVE,
        // Document management
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('document:')),
        // Messaging
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('message:')),
        // Notes
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('note:')),
        // Resources
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('resource:')),
        // Analytics
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('analytics:')),
        // Settings
        PERMISSIONS.SETTINGS_READ,
        PERMISSIONS.SETTINGS_UPDATE,
        // Audit & Compliance
        PERMISSIONS.AUDIT_READ,
        PERMISSIONS.AUDIT_EXPORT,
        PERMISSIONS.COMPLIANCE_READ,
        PERMISSIONS.COMPLIANCE_UPDATE,
        // Support & Help
        PERMISSIONS.SUPPORT_ACCESS,
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.SUPPORT_RESOLVE,
        PERMISSIONS.SUPPORT_ASSIGN,
        // Workflow
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('workflow:')),
        // Notifications
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('notification:')),
    ],
    [ROLES.STAFF]: [
        // User management
        PERMISSIONS.USER_READ,
        // Organization management
        PERMISSIONS.ORGANIZATION_READ,
        // Role management
        PERMISSIONS.ROLE_READ,
        // Permission management
        PERMISSIONS.PERMISSION_READ,
        // Staff permissions
        PERMISSIONS.STAFF_ACCESS,
        // Document management
        PERMISSIONS.DOCUMENT_CREATE,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.DOCUMENT_UPDATE,
        PERMISSIONS.DOCUMENT_SHARE,
        PERMISSIONS.DOCUMENT_VERSION,
        // Messaging
        PERMISSIONS.MESSAGE_CREATE,
        PERMISSIONS.MESSAGE_READ,
        PERMISSIONS.MESSAGE_UPDATE,
        PERMISSIONS.MESSAGE_FORWARD,
        // Notes
        PERMISSIONS.NOTE_CREATE,
        PERMISSIONS.NOTE_READ,
        PERMISSIONS.NOTE_UPDATE,
        PERMISSIONS.NOTE_SHARE,
        // Resources
        PERMISSIONS.RESOURCE_READ,
        // Analytics
        PERMISSIONS.ANALYTICS_READ,
        // Settings
        PERMISSIONS.SETTINGS_READ,
        // Support & Help
        PERMISSIONS.SUPPORT_ACCESS,
        // Notifications
        PERMISSIONS.NOTIFICATION_READ,
    ],
    [ROLES.VIEWER]: [
        // User management
        PERMISSIONS.USER_READ,
        // Organization management
        PERMISSIONS.ORGANIZATION_READ,
        // Role management
        PERMISSIONS.ROLE_READ,
        // Permission management
        PERMISSIONS.PERMISSION_READ,
        // Document management
        PERMISSIONS.DOCUMENT_READ,
        // Messaging
        PERMISSIONS.MESSAGE_READ,
        // Notes
        PERMISSIONS.NOTE_READ,
        // Resources
        PERMISSIONS.RESOURCE_READ,
        // Analytics
        PERMISSIONS.ANALYTICS_READ,
        // Notifications
        PERMISSIONS.NOTIFICATION_READ,
    ],
    [ROLES.SUPPORT]: [
        // User management
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_UPDATE,
        // Role management
        PERMISSIONS.ROLE_READ,
        // Permission management
        PERMISSIONS.PERMISSION_READ,
        // Document management
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.DOCUMENT_UPDATE,
        // Messaging
        PERMISSIONS.MESSAGE_CREATE,
        PERMISSIONS.MESSAGE_READ,
        PERMISSIONS.MESSAGE_UPDATE,
        // Notes
        PERMISSIONS.NOTE_CREATE,
        PERMISSIONS.NOTE_READ,
        PERMISSIONS.NOTE_UPDATE,
        // Resources
        PERMISSIONS.RESOURCE_READ,
        // Support & Help
        PERMISSIONS.SUPPORT_ACCESS,
        PERMISSIONS.SUPPORT_MANAGE,
        PERMISSIONS.SUPPORT_RESOLVE,
        PERMISSIONS.SUPPORT_ASSIGN,
        // Notifications
        PERMISSIONS.NOTIFICATION_CREATE,
        PERMISSIONS.NOTIFICATION_READ,
        PERMISSIONS.NOTIFICATION_UPDATE,
    ],
    [ROLES.AUDITOR]: [
        // User management
        PERMISSIONS.USER_READ,
        // Role management
        PERMISSIONS.ROLE_READ,
        // Permission management
        PERMISSIONS.PERMISSION_READ,
        // Document management
        PERMISSIONS.DOCUMENT_READ,
        // Messaging
        PERMISSIONS.MESSAGE_READ,
        // Notes
        PERMISSIONS.NOTE_READ,
        // Resources
        PERMISSIONS.RESOURCE_READ,
        // Analytics
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.ANALYTICS_EXPORT,
        // Audit & Compliance
        PERMISSIONS.AUDIT_READ,
        PERMISSIONS.AUDIT_EXPORT,
        PERMISSIONS.AUDIT_REVIEW,
        PERMISSIONS.COMPLIANCE_READ,
        // Notifications
        PERMISSIONS.NOTIFICATION_READ,
    ],
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS]; 