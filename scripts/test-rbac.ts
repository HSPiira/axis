import { prisma } from "../src/lib/db";
import { ROLES, PERMISSIONS } from "../src/lib/constants/roles";

async function testRBAC() {
    console.log('Testing RBAC scenarios...\n');

    // Create test users
    console.log('Creating test users...');
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@test.com",
            name: "Admin User"
        }
    });

    const staffUser = await prisma.user.create({
        data: {
            email: "staff@test.com",
            name: "Staff User"
        }
    });

    // Assign roles
    console.log('\nAssigning roles...');
    const adminRole = await prisma.role.findUnique({
        where: { name: ROLES.ADMIN }
    });

    const staffRole = await prisma.role.findUnique({
        where: { name: ROLES.STAFF }
    });

    if (!adminRole || !staffRole) {
        throw new Error('Roles not found');
    }

    await prisma.userRole.create({
        data: {
            userId: adminUser.id,
            roleId: adminRole.id
        }
    });

    await prisma.userRole.create({
        data: {
            userId: staffUser.id,
            roleId: staffRole.id
        }
    });

    // Test role assignments
    console.log('\nVerifying role assignments...');

    const adminUserRoles = await prisma.userRole.findMany({
        where: { userId: adminUser.id },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });

    const staffUserRoles = await prisma.userRole.findMany({
        where: { userId: staffUser.id },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });

    // Check admin permissions
    console.log('\nChecking admin permissions:');
    const adminPermissions = adminUserRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission.name)
    );

    const expectedAdminPermissions = [
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_READ,
        PERMISSIONS.ROLE_CREATE,
        PERMISSIONS.PERMISSION_CREATE
    ];

    for (const permission of expectedAdminPermissions) {
        const hasPermission = adminPermissions.includes(permission);
        console.log(`${permission}: ${hasPermission ? '✓' : '✗'}`);
    }

    // Check staff permissions
    console.log('\nChecking staff permissions:');
    const staffPermissions = staffUserRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission.name)
    );

    const expectedStaffPermissions = [
        PERMISSIONS.USER_CREATE, // Should be false
        PERMISSIONS.USER_READ,   // Should be true
        PERMISSIONS.ROLE_CREATE, // Should be false
        PERMISSIONS.STAFF_ACCESS // Should be true
    ];

    for (const permission of expectedStaffPermissions) {
        const hasPermission = staffPermissions.includes(permission);
        console.log(`${permission}: ${hasPermission ? '✓' : '✗'}`);
    }

    // Cleanup
    console.log('\nCleaning up test data...');
    await prisma.userRole.deleteMany({
        where: {
            userId: {
                in: [adminUser.id, staffUser.id]
            }
        }
    });

    await prisma.user.deleteMany({
        where: {
            id: {
                in: [adminUser.id, staffUser.id]
            }
        }
    });

    console.log('\nRBAC testing completed!');
}

testRBAC().catch(console.error); 