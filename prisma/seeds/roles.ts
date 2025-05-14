import { PrismaClient } from '@/generated/prisma';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/constants/roles';

const roles = [
    {
        name: ROLES.ADMIN,
        description: 'Full system access with all permissions',
        permissions: Object.values(PERMISSIONS)
    },
    {
        name: ROLES.MANAGER,
        description: 'Department-level access with limited administrative capabilities',
        permissions: ROLE_PERMISSIONS[ROLES.MANAGER]
    },
    {
        name: ROLES.STAFF,
        description: 'Regular staff member with basic operational access',
        permissions: ROLE_PERMISSIONS[ROLES.STAFF]
    },
    {
        name: ROLES.VIEWER,
        description: 'Read-only access to view system information',
        permissions: ROLE_PERMISSIONS[ROLES.VIEWER]
    },
    {
        name: ROLES.SUPPORT,
        description: 'Support staff with access to help and resolve issues',
        permissions: ROLE_PERMISSIONS[ROLES.SUPPORT]
    },
    {
        name: ROLES.AUDITOR,
        description: 'Audit and compliance monitoring access',
        permissions: ROLE_PERMISSIONS[ROLES.AUDITOR]
    }
];

export async function seedRoles(prisma: PrismaClient) {
    try {
        console.log('🌱 Starting roles and permissions seeding...');

        // First, create all permissions
        console.log('Creating permissions...');
        for (const [key, permissionName] of Object.entries(PERMISSIONS)) {
            await prisma.permission.upsert({
                where: { name: permissionName },
                update: {
                    description: `Permission to ${permissionName.split(':')[1]} ${permissionName.split(':')[0]}`
                },
                create: {
                    name: permissionName,
                    description: `Permission to ${permissionName.split(':')[1]} ${permissionName.split(':')[0]}`
                }
            });
        }

        // Then create roles and their permissions
        for (const roleData of roles) {
            const { permissions, ...roleInfo } = roleData;

            // Create or update role
            console.log(`Creating role: ${roleInfo.name}`);
            const role = await prisma.role.upsert({
                where: { name: roleInfo.name },
                update: roleInfo,
                create: roleInfo
            });

            // Link permissions to the role
            for (const permissionName of permissions) {
                if (!permissionName) continue; // Skip undefined permissions
                console.log(`Assigning permission: ${permissionName} to role ${role.name}`);

                // Get the permission
                const permission = await prisma.permission.findUnique({
                    where: { name: permissionName }
                });

                if (permission) {
                    // Create role-permission relationship
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: role.id,
                                permissionId: permission.id
                            }
                        },
                        update: {},
                        create: {
                            roleId: role.id,
                            permissionId: permission.id
                        }
                    });
                }
            }
        }

        console.log('✅ Roles and permissions seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding roles and permissions:', error);
        throw error;
    }
} 