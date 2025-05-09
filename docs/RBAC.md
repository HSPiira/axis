# Role-Based Access Control (RBAC) Documentation

## Overview
This document describes the Role-Based Access Control (RBAC) system implemented in our application. The system uses a combination of roles and permissions to control access to different parts of the application.

## System Components

### 1. Roles
Roles are predefined sets of permissions. Currently, we have two main roles:
- **Admin**: Has full access to all features
- **Staff**: Has basic access with limited permissions

### 2. Permissions
Permissions are granular access controls that define what actions a user can perform. They follow the format `resource:action`.

Current permissions include:
```typescript
// User management
USER_CREATE: 'user:create'
USER_READ: 'user:read'
USER_UPDATE: 'user:update'
USER_DELETE: 'user:delete'

// Role management
ROLE_CREATE: 'role:create'
ROLE_READ: 'role:read'
ROLE_UPDATE: 'role:update'
ROLE_DELETE: 'role:delete'

// Permission management
PERMISSION_CREATE: 'permission:create'
PERMISSION_READ: 'permission:read'
PERMISSION_UPDATE: 'permission:update'
PERMISSION_DELETE: 'permission:delete'

// Staff permissions
STAFF_ACCESS: 'staff:access'
```

## Setup Process

### 1. Initial Setup
Run the setup script to initialize the RBAC system:
```bash
pnpm run setup-rbac
```
This will:
- Create all necessary roles
- Create all permissions
- Assign permissions to roles
- Set up the basic structure

### 2. Verification
Verify the setup using:
```bash
pnpm run verify-rbac
```
This checks:
- All roles exist
- All permissions exist
- Role-permission assignments are correct
- No missing permissions

## Usage

### 1. Protecting Components
Use the `usePermission` hook to protect React components:
```typescript
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/lib/constants/roles';

function ProtectedComponent() {
  const { hasPermission, isLoading } = usePermission(PERMISSIONS.USER_CREATE);

  if (isLoading) return <div>Loading...</div>;
  if (!hasPermission) return <div>Access denied</div>;

  return <div>Protected content</div>;
}
```

### 2. Protecting API Routes
Use the `withPermission` middleware to protect API routes:
```typescript
import { withPermission } from '@/middleware/check-permission';
import { PERMISSIONS } from '@/lib/constants/roles';

export const POST = withPermission(PERMISSIONS.USER_CREATE)(async (req) => {
  // Protected API logic here
});
```

### 3. Checking Permissions in Server Components
Use the `checkPermission` function in server components:
```typescript
import { checkPermission } from '@/middleware/check-permission';
import { PERMISSIONS } from '@/lib/constants/roles';

async function ServerComponent() {
  const hasPermission = await checkPermission(request, PERMISSIONS.USER_CREATE);
  
  if (!hasPermission) {
    return <div>Access denied</div>;
  }
  
  return <div>Protected content</div>;
}
```

## Automatic Role Assignment

### New User Registration
When a new user registers:
1. The user is created in the database
2. The `createUser` event in NextAuth triggers
3. The user is automatically assigned the `staff` role
4. The user gets basic permissions:
   - `staff:access`
   - `user:read`
   - `role:read`
   - `permission:read`

## Best Practices

1. **Permission Granularity**
   - Keep permissions specific and granular
   - Use the format `resource:action`
   - Avoid overly broad permissions

2. **Role Management**
   - Create roles based on job functions
   - Assign minimum required permissions
   - Document role purposes and permissions

3. **Security**
   - Always check permissions on both client and server
   - Use middleware for API routes
   - Implement proper session management

4. **Testing**
   - Test permission checks thoroughly
   - Verify role assignments
   - Test edge cases and unauthorized access

## Maintenance

### Adding New Permissions
1. Add the permission to `PERMISSIONS` in `src/lib/constants/roles.ts`
2. Run the setup script to create the permission
3. Assign the permission to appropriate roles

### Adding New Roles
1. Add the role to `ROLES` in `src/lib/constants/roles.ts`
2. Define the role's permissions
3. Update the setup script if needed
4. Run the setup script

### Modifying Role Permissions
1. Update the role's permissions in the setup script
2. Run the setup script to apply changes

## Troubleshooting

### Common Issues
1. **Permission Not Working**
   - Verify the permission exists in the database
   - Check if the user has the correct role
   - Verify the role has the permission

2. **Role Assignment Issues**
   - Check the user's roles in the database
   - Verify the role exists
   - Check role-permission assignments

3. **Setup Problems**
   - Run the verification script
   - Check database connections
   - Verify environment variables

## Support
For issues or questions:
1. Check the verification script output
2. Review the database using Prisma Studio
3. Check the application logs
4. Contact the development team 