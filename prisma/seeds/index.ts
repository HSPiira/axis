// prisma/seeds/index.ts
import { PrismaClient } from '@prisma/client';
import { seedIndustries } from './industries';
// import { seedRoles } from './roles';
// import { seedServices } from './services';
// import { seedSuperAdmin } from './admin';
// import { seedKPIs } from './kpis';
// import other seeders as you create them

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🌱 Starting database seeding...');

        // await seedRoles(prisma); // Seed roles and permissions first as they are fundamental
        // await seedSuperAdmin(prisma); // Seed super admin user
        await seedIndustries(prisma); // Seed industries
        // await seedServices(prisma); // Seed services and categories 
        // await seedKPIs(prisma); // Seed KPIs

        // Add other seeders here as they are created
        // await seedPermissions(prisma);
        // etc...

        console.log('✅ Database seeding completed successfully');
    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();