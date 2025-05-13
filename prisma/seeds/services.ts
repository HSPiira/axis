import { PrismaClient, ServiceStatus } from '@/generated/prisma';

const serviceCategories = [
    {
        name: 'Healthcare Services',
        description: 'Medical and healthcare-related services',
        services: [
            { name: 'Primary Care', description: 'Basic healthcare services including check-ups and preventive care', status: ServiceStatus.ACTIVE },
            { name: 'Mental Health Counseling', description: 'Professional mental health support and counseling services', status: ServiceStatus.ACTIVE },
            { name: 'Health Education', description: 'Educational programs about health and wellness', status: ServiceStatus.ACTIVE }
        ]
    },
    {
        name: 'Social Services',
        description: 'Community and social support services',
        services: [
            {
                name: 'Case Management',
                description: 'Comprehensive case management and support coordination',
                status: ServiceStatus.ACTIVE
            },
            {
                name: 'Food Assistance',
                description: 'Food bank and nutrition support services',
                status: ServiceStatus.ACTIVE
            },
            {
                name: 'Housing Support',
                description: 'Housing assistance and shelter services',
                status: ServiceStatus.ACTIVE
            }
        ]
    },
    {
        name: 'Educational Services',
        description: 'Learning and educational support services',
        services: [
            {
                name: 'Tutoring',
                description: 'Academic tutoring and homework assistance',
                status: ServiceStatus.ACTIVE
            },
            {
                name: 'Life Skills Training',
                description: 'Training in essential life skills and personal development',
                status: ServiceStatus.ACTIVE
            },
            {
                name: 'Career Counseling',
                description: 'Career guidance and job search assistance',
                status: ServiceStatus.ACTIVE
            }
        ]
    },
    {
        name: 'Emergency Services',
        description: 'Crisis and emergency support services',
        services: [
            {
                name: 'Crisis Intervention',
                description: 'Immediate support and intervention in crisis situations',
                status: ServiceStatus.ACTIVE
            },
            {
                name: 'Emergency Shelter',
                description: 'Temporary housing during emergency situations',
                status: ServiceStatus.ACTIVE
            },
            {
                name: '24/7 Hotline',
                description: 'Round-the-clock emergency support hotline',
                status: ServiceStatus.ACTIVE
            }
        ]
    }
];

export async function seedServices(prisma: PrismaClient) {
    try {
        console.log('🌱 Starting service categories and services seeding...');

        for (const categoryData of serviceCategories) {
            const { services, ...categoryInfo } = categoryData;

            // Create or update service category
            console.log(`Creating service category: ${categoryInfo.name}`);
            const category = await prisma.serviceCategory.upsert({
                where: { name: categoryInfo.name },
                update: categoryInfo,
                create: categoryInfo
            });

            // Create services for this category
            for (const serviceData of services) {
                console.log(`Creating service: ${serviceData.name} in category ${category.name}`);
                const existingService = await prisma.service.findFirst({
                    where: {
                        name: serviceData.name,
                        categoryId: category.id
                    }
                });

                if (existingService) {
                    await prisma.service.update({
                        where: { id: existingService.id },
                        data: { ...serviceData, categoryId: category.id }
                    });
                } else {
                    await prisma.service.create({
                        data: { ...serviceData, categoryId: category.id }
                    });
                }
            }
        }

        console.log('✅ Service categories and services seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding service categories and services:', error);
        throw error;
    }
} 