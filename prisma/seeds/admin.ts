import { PrismaClient, Gender } from '@/generated/prisma';
import { ROLES } from '@/lib/constants/roles';
import bcrypt from 'bcryptjs';

const superAdmin = {
    email: 'admin@care.com',
    password: 'admin1234',
    profile: {
        fullName: 'System Administrator',
        email: 'admin@care.com',
        phone: '+1234567890',
        gender: Gender.OTHER
    }
};

export async function seedSuperAdmin(prisma: PrismaClient) {
    try {
        console.log('🌱 Starting super admin seeding...');

        // Hash the password
        const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

        // Create or update the super admin user
        console.log('Creating super admin user...');
        const user = await prisma.user.upsert({
            where: { email: superAdmin.email },
            update: {},
            create: {
                email: superAdmin.email,
                emailVerified: new Date(),
                password: hashedPassword,
                profile: {
                    create: {
                        fullName: superAdmin.profile.fullName,
                        email: superAdmin.profile.email,
                        phone: superAdmin.profile.phone,
                        gender: Gender.OTHER
                    }
                }
            }
        });

        // Get the admin role
        const adminRole = await prisma.role.findUnique({
            where: { name: ROLES.ADMIN }
        });

        if (!adminRole) {
            throw new Error('Admin role not found. Please run role seeding first.');
        }

        // Assign admin role to the super admin user
        console.log('Assigning admin role to super admin...');
        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: user.id,
                    roleId: adminRole.id
                }
            },
            update: {},
            create: {
                userId: user.id,
                roleId: adminRole.id
            }
        });

        console.log('✅ Super admin seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding super admin:', error);
        throw error;
    }
} 