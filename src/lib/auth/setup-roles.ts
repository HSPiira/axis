import { prisma } from "@/lib/db";
import { ROLES, PERMISSIONS, type RoleType } from "@/lib/constants/roles";

export async function setupRolesAndPermissions() {
    try {
        // Create all permissions
        const permissionPromises = Object.values(PERMISSIONS).map(permissionName =>
            prisma.permission.upsert({
                where: { name: permissionName },
                update: {},
                create: {
                    name: permissionName,
                    description: `Permission to ${permissionName.replace(':', ' ')}`
                }
            })
        );
        await Promise.all(permissionPromises);

        // Create admin role with all permissions
        const adminRole = await prisma.role.upsert({
            where: { name: ROLES.ADMIN },
            update: {},
            create: {
                name: ROLES.ADMIN,
                description: 'Administrator with full access to all features'
            }
        });

        // Get all permissions
        const allPermissions = await prisma.permission.findMany();

        // Assign all permissions to admin role
        await prisma.rolePermission.deleteMany({
            where: { roleId: adminRole.id }
        });

        await prisma.rolePermission.createMany({
            data: allPermissions.map(permission => ({
                roleId: adminRole.id,
                permissionId: permission.id
            }))
        });

        // Create staff role with basic permissions
        const staffRole = await prisma.role.upsert({
            where: { name: ROLES.STAFF },
            update: {},
            create: {
                name: ROLES.STAFF,
                description: 'Staff member with basic access'
            }
        });

        // Define staff permissions
        const staffPermissions = [
            PERMISSIONS.STAFF_ACCESS,
            PERMISSIONS.USER_READ,
            PERMISSIONS.ROLE_READ,
            PERMISSIONS.PERMISSION_READ
        ];

        // Get staff permission records
        const staffPermissionRecords = await prisma.permission.findMany({
            where: {
                name: {
                    in: staffPermissions
                }
            }
        });

        // Assign staff permissions
        await prisma.rolePermission.deleteMany({
            where: { roleId: staffRole.id }
        });

        await prisma.rolePermission.createMany({
            data: staffPermissionRecords.map(permission => ({
                roleId: staffRole.id,
                permissionId: permission.id
            }))
        });

        console.log('Successfully set up roles and permissions');
    } catch (error) {
        console.error('Error setting up roles and permissions:', error);
        throw error;
    }
}

export async function assignRoleToUser(userId: string, roleName: RoleType) {
    try {
        const role = await prisma.role.findUnique({
            where: { name: roleName }
        });

        if (!role) {
            throw new Error(`Role ${roleName} not found`);
        }

        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId,
                    roleId: role.id
                }
            },
            update: {},
            create: {
                userId,
                roleId: role.id
            }
        });

        console.log(`Successfully assigned role ${roleName} to user ${userId}`);
    } catch (error) {
        console.error('Error assigning role to user:', error);
        throw error;
    }
} 