import { setupRolesAndPermissions } from "../src/lib/auth/setup-roles";

async function main() {
    console.log('Setting up RBAC system...');

    try {
        await setupRolesAndPermissions();
        console.log('RBAC system setup completed successfully!');
    } catch (error) {
        console.error('Error setting up RBAC system:', error);
        process.exit(1);
    }
}

main(); 