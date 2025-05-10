import { prisma } from "@/lib/db";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, type RoleType, type PermissionType } from "@/lib/constants/roles";

const BATCH_SIZE = 10;

export async function setupRolesAndPermissions() {
    try {
        // Create all permissions in batches
        const permissionValues = Object.values(PERMISSIONS);
        for (let i = 0; i < permissionValues.length; i += BATCH_SIZE) {
            const batch = permissionValues.slice(i, i + BATCH_SIZE);
            const permissionPromises = batch.map(permissionName =>
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
            console.log(`Created/updated permissions ${i + 1} to ${Math.min(i + BATCH_SIZE, permissionValues.length)}`);
        }

        // Get all permissions
        const allPermissions = await prisma.permission.findMany();

        // Create or update all roles and their permissions
        for (const [roleName, rolePermissions] of Object.entries(ROLE_PERMISSIONS)) {
            console.log(`Setting up role: ${roleName}`);

            // Create or update the role
            const role = await prisma.role.upsert({
                where: { name: roleName },
                update: {},
                create: {
                    name: roleName,
                    description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`
                }
            });

            // Get the permission IDs for this role
            const rolePermissionIds = allPermissions
                .filter(p => (rolePermissions as PermissionType[]).includes(p.name as PermissionType))
                .map(p => p.id);

            // Remove existing role permissions
            await prisma.rolePermission.deleteMany({
                where: { roleId: role.id }
            });

            // Create new role permissions in batches
            for (let i = 0; i < rolePermissionIds.length; i += BATCH_SIZE) {
                const batch = rolePermissionIds.slice(i, i + BATCH_SIZE);
                if (batch.length > 0) {
                    await prisma.rolePermission.createMany({
                        data: batch.map(permissionId => ({
                            roleId: role.id,
                            permissionId
                        }))
                    });
                }
            }
            console.log(`Completed setup for role: ${roleName}`);
        }

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