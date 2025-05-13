import { prisma } from "@/lib/db";
import { PERMISSIONS, ROLES } from "@/lib/constants/roles";
import { SignJWT } from "jose";

async function getTestUserToken() {
    // Create or get test user
    let user = await prisma.user.findUnique({
        where: { email: "test@test.com" },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "test@test.com",
                name: "Test User",
            },
        });

        // Get or create admin role
        let adminRole = await prisma.role.findUnique({
            where: { name: ROLES.ADMIN },
        });

        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: ROLES.ADMIN,
                    description: "Administrator role",
                },
            });
        }

        // Assign admin role to user
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: adminRole.id,
            },
        });
    }

    // Create JWT token
    const secret = new TextEncoder().encode("your-test-secret-key-for-development");
    const token = await new SignJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

    return token;
}

async function testApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`http://localhost:3003/api${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(`API call failed: ${response.status} ${error.error || response.statusText}`);
    }

    return response.json();
}

async function cleanupExistingData() {
    try {
        // Get all industries
        const response = await fetch("http://localhost:3003/api/industries", {
            headers: {
                Authorization: `Bearer ${await getTestUserToken()}`,
            },
        });
        const { data: industries } = await response.json();

        if (industries.length > 0) {
            // Sort industries by hierarchy (children first)
            const childIndustries = industries.filter((i: any) => i.parentId);
            const parentIndustries = industries.filter((i: any) => !i.parentId);

            // Delete child industries first
            if (childIndustries.length > 0) {
                await fetch("http://localhost:3003/api/industries/bulk", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getTestUserToken()}`,
                    },
                    body: JSON.stringify({
                        industryIds: childIndustries.map((i: any) => i.id),
                    }),
                });
            }

            // Then delete parent industries
            if (parentIndustries.length > 0) {
                await fetch("http://localhost:3003/api/industries/bulk", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getTestUserToken()}`,
                    },
                    body: JSON.stringify({
                        industryIds: parentIndustries.map((i: any) => i.id),
                    }),
                });
            }
        }

        console.log("✓ Cleaned up existing test data");
    } catch (error) {
        console.error("Error cleaning up test data:", error);
    }
}

async function testIndustries() {
    console.log("Starting industry API tests...\n");

    let token: string | null = null;
    const createdIndustryIds: string[] = [];

    try {
        // Get test user token
        token = await getTestUserToken();

        // Clean up any existing test data
        await cleanupExistingData();

        // Test data
        const testIndustry = {
            name: "Test Industry",
            code: "TEST",
            description: "Test industry description",
        };

        const testIndustries = [
            {
                name: "Parent Industry",
                code: "PARENT",
                description: "Parent industry description",
            },
            {
                name: "Child Industry",
                code: "CHILD",
                description: "Child industry description",
            },
        ];

        try {
            // Test 1: Create industry
            console.log("Test 1: Creating industry...");
            const createdIndustry = await testApi("/industries", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(testIndustry),
            });
            createdIndustryIds.push(createdIndustry.id);
            console.log("✓ Industry created:", createdIndustry.name);

            // Test 2: Get industries list
            console.log("\nTest 2: Getting industries list...");
            const industriesList = await testApi("/industries", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("✓ Retrieved industries list");

            // Test 3: Get single industry
            console.log("\nTest 3: Getting single industry...");
            const singleIndustry = await testApi(`/industries/${createdIndustry.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("✓ Retrieved single industry:", singleIndustry.name);

            // Test 4: Update industry
            console.log("\nTest 4: Updating industry...");
            const updatedIndustry = await testApi(`/industries/${createdIndustry.id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: "Updated Industry",
                    description: "Updated description",
                }),
            });
            console.log("✓ Industry updated:", updatedIndustry.name);

            // Test 5: Bulk create industries
            console.log("\nTest 5: Bulk creating industries...");
            const bulkCreated = await testApi("/industries/bulk", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ industries: testIndustries }),
            });
            createdIndustryIds.push(...bulkCreated.data.map((i: any) => i.id));
            console.log("✓ Bulk created industries:", bulkCreated.data.length);

            // Test 6: Update hierarchy
            console.log("\nTest 6: Updating industry hierarchy...");
            const hierarchyUpdated = await testApi("/industries/hierarchy", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    industryId: bulkCreated.data[1].id, // Child industry
                    parentId: bulkCreated.data[0].id, // Parent industry
                }),
            });
            console.log("✓ Updated hierarchy:", hierarchyUpdated.name);

            // Test 7: Get hierarchy
            console.log("\nTest 7: Getting industry hierarchy...");
            const hierarchy = await testApi("/industries/hierarchy", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("✓ Retrieved hierarchy");

            // Test 8: Export industries
            console.log("\nTest 8: Exporting industries...");
            const exportResponse = await fetch("http://localhost:3002/api/industries/export", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const exportData = await exportResponse.text();
            console.log("✓ Exported industries to CSV");

            // Test 9: Import industries
            console.log("\nTest 9: Importing industries...");
            const importFormData = new FormData();
            importFormData.append("file", new Blob([exportData], { type: "text/csv" }), "industries.csv");
            const importResponse = await fetch("http://localhost:3002/api/industries/import", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: importFormData,
            });
            const importResult = await importResponse.json();
            if (importResult.data?.created) {
                createdIndustryIds.push(...importResult.data.created.map((i: any) => i.id));
            }
            console.log("✓ Imported industries from CSV");

            // Test 10: Delete industries
            console.log("\nTest 10: Deleting industries...");

            // Get all industries to determine the hierarchy
            const allIndustries = await testApi("/industries", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Sort industries by hierarchy (children first)
            const childIndustries = allIndustries.data.filter((i: any) => i.parentId);
            const parentIndustries = allIndustries.data.filter((i: any) => !i.parentId);

            // Delete child industries first
            if (childIndustries.length > 0) {
                await testApi("/industries/bulk", {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        industryIds: childIndustries.map((i: any) => i.id),
                    }),
                });
                console.log("✓ Deleted child industries");
            }

            // Then delete parent industries
            if (parentIndustries.length > 0) {
                await testApi("/industries/bulk", {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        industryIds: parentIndustries.map((i: any) => i.id),
                    }),
                });
                console.log("✓ Deleted parent industries");
            }

            console.log("\nAll tests passed! ✨");
        } catch (error) {
            console.error("\nTest failed:", error);
            throw error;
        }
    } catch (error) {
        console.error("\nTest failed:", error);
        throw error;
    }
}

testIndustries().catch(console.error); 