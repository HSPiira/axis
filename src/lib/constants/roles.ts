export const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    MANAGER: 'manager',
    VIEWER: 'viewer',
    SUPPORT: 'support',
    AUDITOR: 'auditor',
} as const;

export const PERMISSIONS = {
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
    INDUSTRY_CREATE: 'industry:create',
    INDUSTRY_READ: 'industry:read',
    INDUSTRY_UPDATE: 'industry:update',
    INDUSTRY_DELETE: 'industry:delete',
    INDUSTRY_ASSIGN: 'industry:assign',
    INDUSTRY_IMPORT: 'industry:import',
    INDUSTRY_EXPORT: 'industry:export',
    INDUSTRY_HIERARCHY: 'industry:hierarchy',

    // Document management
    DOCUMENT_CREATE: 'document:create',
    DOCUMENT_READ: 'document:read',
    DOCUMENT_UPDATE: 'document:update',
    DOCUMENT_DELETE: 'document:delete',
    DOCUMENT_SHARE: 'document:share',
    DOCUMENT_VERSION: 'document:version',
    DOCUMENT_APPROVE: 'document:approve',
    DOCUMENT_REJECT: 'document:reject',
    DOCUMENT_ARCHIVE: 'document:archive',
    DOCUMENT_RESTORE: 'document:restore',
    DOCUMENT_EXPORT: 'document:export',
    DOCUMENT_IMPORT: 'document:import',

    // Messaging
    MESSAGE_CREATE: 'message:create',
    MESSAGE_READ: 'message:read',
    MESSAGE_UPDATE: 'message:update',
    MESSAGE_DELETE: 'message:delete',
    MESSAGE_ARCHIVE: 'message:archive',
    MESSAGE_PIN: 'message:pin',
    MESSAGE_FORWARD: 'message:forward',
    MESSAGE_BROADCAST: 'message:broadcast',

    // Notes
    NOTE_CREATE: 'note:create',
    NOTE_READ: 'note:read',
    NOTE_UPDATE: 'note:update',
    NOTE_DELETE: 'note:delete',
    NOTE_SHARE: 'note:share',
    NOTE_ARCHIVE: 'note:archive',
    NOTE_RESTORE: 'note:restore',
    NOTE_EXPORT: 'note:export',

    // Resources
    RESOURCE_CREATE: 'resource:create',
    RESOURCE_READ: 'resource:read',
    RESOURCE_UPDATE: 'resource:update',
    RESOURCE_DELETE: 'resource:delete',
    RESOURCE_SHARE: 'resource:share',
    RESOURCE_APPROVE: 'resource:approve',
    RESOURCE_REJECT: 'resource:reject',
    RESOURCE_ARCHIVE: 'resource:archive',
    RESOURCE_RESTORE: 'resource:restore',

    // Analytics
    ANALYTICS_READ: 'analytics:read',
    ANALYTICS_EXPORT: 'analytics:export',
    ANALYTICS_CUSTOM: 'analytics:custom',
    ANALYTICS_SHARE: 'analytics:share',
    ANALYTICS_SCHEDULE: 'analytics:schedule',

    // Settings
    SETTINGS_READ: 'settings:read',
    SETTINGS_UPDATE: 'settings:update',
    SETTINGS_ADVANCED: 'settings:advanced',
    SETTINGS_SECURITY: 'settings:security',
    SETTINGS_INTEGRATION: 'settings:integration',

    // Audit & Compliance
    AUDIT_READ: 'audit:read',
    AUDIT_EXPORT: 'audit:export',
    AUDIT_REVIEW: 'audit:review',
    COMPLIANCE_READ: 'compliance:read',
    COMPLIANCE_UPDATE: 'compliance:update',
    COMPLIANCE_APPROVE: 'compliance:approve',

    // Support & Help
    SUPPORT_ACCESS: 'support:access',
    SUPPORT_MANAGE: 'support:manage',
    SUPPORT_RESOLVE: 'support:resolve',
    SUPPORT_ASSIGN: 'support:assign',
    SUPPORT_PRIORITIZE: 'support:prioritize',

    // Workflow
    WORKFLOW_CREATE: 'workflow:create',
    WORKFLOW_READ: 'workflow:read',
    WORKFLOW_UPDATE: 'workflow:update',
    WORKFLOW_DELETE: 'workflow:delete',
    WORKFLOW_APPROVE: 'workflow:approve',
    WORKFLOW_REJECT: 'workflow:reject',
    WORKFLOW_ASSIGN: 'workflow:assign',

    // Notifications
    NOTIFICATION_CREATE: 'notification:create',
    NOTIFICATION_READ: 'notification:read',
    NOTIFICATION_UPDATE: 'notification:update',
    NOTIFICATION_DELETE: 'notification:delete',
    NOTIFICATION_BROADCAST: 'notification:broadcast',
} as const;

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
        // Workflow
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('workflow:')),
        // Notifications
        ...Object.values(PERMISSIONS).filter(p => p.startsWith('notification:')),
    ],
    [ROLES.STAFF]: [
        // User management
        PERMISSIONS.USER_READ,
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