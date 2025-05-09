import { prisma } from "../src/lib/db";
import { ROLES, PERMISSIONS } from "../src/lib/constants/roles";

async function verifyRBAC() {
    console.log('Verifying RBAC setup...\n');

    // Check roles
    console.log('Checking roles...');
    const roles = await prisma.role.findMany();
    console.log(`Found ${roles.length} roles:`);
    roles.forEach(role => {
        console.log(`- ${role.name}: ${role.description}`);
    });

    // Check permissions
    console.log('\nChecking permissions...');
    const permissions = await prisma.permission.findMany();
    console.log(`Found ${permissions.length} permissions:`);
    console.log(`Expected ${Object.keys(PERMISSIONS).length} permissions`);

    // Check admin role permissions
    console.log('\nChecking admin role permissions...');
    const adminRole = await prisma.role.findUnique({
        where: { name: ROLES.ADMIN },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            }
        }
    });

    if (adminRole) {
        console.log(`Admin role has ${adminRole.permissions.length} permissions:`);
        adminRole.permissions.forEach(rp => {
            console.log(`- ${rp.permission.name}`);
        });
    } else {
        console.log('Admin role not found!');
    }

    // Check staff role permissions
    console.log('\nChecking staff role permissions...');
    const staffRole = await prisma.role.findUnique({
        where: { name: ROLES.STAFF },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            }
        }
    });

    if (staffRole) {
        console.log(`Staff role has ${staffRole.permissions.length} permissions:`);
        staffRole.permissions.forEach(rp => {
            console.log(`- ${rp.permission.name}`);
        });
    } else {
        console.log('Staff role not found!');
    }

    // Verify all expected permissions exist
    console.log('\nVerifying all expected permissions exist...');
    const missingPermissions = Object.values(PERMISSIONS).filter(
        permName => !permissions.some(p => p.name === permName)
    );

    if (missingPermissions.length > 0) {
        console.log('Missing permissions:');
        missingPermissions.forEach(p => console.log(`- ${p}`));
    } else {
        console.log('All expected permissions exist ✓');
    }

    console.log('\nRBAC verification completed!');
}

verifyRBAC().catch(console.error); 