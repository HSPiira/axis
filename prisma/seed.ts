import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.permission.createMany({
        data: [
            // User management
            { name: 'view_users', description: 'Can view users' },
            { name: 'create_users', description: 'Can create new users' },
            { name: 'edit_users', description: 'Can edit existing users' },
            { name: 'delete_users', description: 'Can delete users' },

            // Role management
            { name: 'view_roles', description: 'Can view roles' },
            { name: 'create_roles', description: 'Can create new roles' },
            { name: 'edit_roles', description: 'Can edit existing roles' },
            { name: 'delete_roles', description: 'Can delete roles' },

            // Permission management
            { name: 'view_permissions', description: 'Can view permissions' },
            { name: 'assign_permissions', description: 'Can assign permissions to roles' },

            // Security settings
            { name: 'view_security_settings', description: 'Can view security settings' },
            { name: 'edit_security_settings', description: 'Can edit security settings' },

            // Access policies
            { name: 'view_access_policies', description: 'Can view access policies' },
            { name: 'edit_access_policies', description: 'Can edit access policies' },

            // General
            { name: 'view_dashboard', description: 'Can view dashboard' },
            { name: 'manage_resources', description: 'Can manage resources' },
        ],
        skipDuplicates: true,
    });
    console.log('Seed result:', result);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
