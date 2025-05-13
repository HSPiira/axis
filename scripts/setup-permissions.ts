import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/constants/roles";

async function setupPermissions() {
    console.log("Setting up industry permissions...\n");

    const industryPermissions = [
        PERMISSIONS.INDUSTRY_CREATE,
        PERMISSIONS.INDUSTRY_READ,
        PERMISSIONS.INDUSTRY_UPDATE,
        PERMISSIONS.INDUSTRY_DELETE,
        PERMISSIONS.INDUSTRY_ASSIGN,
        PERMISSIONS.INDUSTRY_IMPORT,
        PERMISSIONS.INDUSTRY_EXPORT,
        PERMISSIONS.INDUSTRY_HIERARCHY,
    ];

    try {
        // Create permissions if they don't exist
        for (const permission of industryPermissions) {
            const existing = await prisma.permission.findUnique({
                where: { name: permission },
            });

            if (existing) {
                console.log(`✓ Permission already exists: ${permission}`);
            } else {
                await prisma.permission.create({
                    data: {
                        name: permission,
                        description: `Permission to ${permission.toLowerCase().replace(/_/g, " ")}`,
                    },
                });
                console.log(`✓ Permission created: ${permission}`);
            }
        }

        console.log("\nAll permissions set up successfully! 🎉");
    } catch (error) {
        console.error("\nError setting up permissions:", error);
        process.exit(1);
    }
}

// Run setup
setupPermissions().catch(console.error); 