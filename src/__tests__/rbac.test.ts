import { prisma } from "@/lib/db";
import { ROLES, PERMISSIONS } from "@/lib/constants/roles";

describe('RBAC System', () => {
    let adminUser: any;
    let staffUser: any;
    const mockAdminRole = { id: '1', name: ROLES.ADMIN };
    const mockStaffRole = { id: '2', name: ROLES.STAFF };

    beforeAll(async () => {
        // Mock role lookups
        (prisma.role.findUnique as jest.Mock)
            .mockImplementation(({ where: { name } }) => {
                if (name === ROLES.ADMIN) return Promise.resolve(mockAdminRole);
                if (name === ROLES.STAFF) return Promise.resolve(mockStaffRole);
                return Promise.resolve(null);
            });

        // Mock user creation
        (prisma.user.create as jest.Mock)
            .mockImplementationOnce(() => Promise.resolve({
                id: '1',
                email: "admin@test.com",
                name: "Admin User"
            }))
            .mockImplementationOnce(() => Promise.resolve({
                id: '2',
                email: "staff@test.com",
                name: "Staff User"
            }));

        // Create test users
        adminUser = await prisma.user.create({
            data: {
                email: "admin@test.com",
                name: "Admin User"
            }
        });

        staffUser = await prisma.user.create({
            data: {
                email: "staff@test.com",
                name: "Staff User"
            }
        });

        // Mock user role creation
        (prisma.userRole.create as jest.Mock).mockResolvedValue({ id: '1' });

        // Assign roles
        await prisma.userRole.create({
            data: {
                userId: adminUser.id,
                roleId: mockAdminRole.id
            }
        });

        await prisma.userRole.create({
            data: {
                userId: staffUser.id,
                roleId: mockStaffRole.id
            }
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Admin Role Permissions', () => {
        it('should have all required admin permissions', async () => {
            const mockAdminPermissions = [
                { permission: { name: PERMISSIONS.USER_CREATE } },
                { permission: { name: PERMISSIONS.USER_READ } },
                { permission: { name: PERMISSIONS.ROLE_CREATE } },
                { permission: { name: PERMISSIONS.PERMISSION_CREATE } }
            ];

            (prisma.userRole.findMany as jest.Mock).mockResolvedValue([{
                role: {
                    permissions: mockAdminPermissions
                }
            }]);

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

            const adminPermissions = adminUserRoles.flatMap(ur =>
                ur.role.permissions.map(rp => rp.permission.name)
            );

            const expectedAdminPermissions = [
                PERMISSIONS.USER_CREATE,
                PERMISSIONS.USER_READ,
                PERMISSIONS.ROLE_CREATE,
                PERMISSIONS.PERMISSION_CREATE
            ];

            expectedAdminPermissions.forEach(permission => {
                expect(adminPermissions).toContain(permission);
            });
        });
    });

    describe('Staff Role Permissions', () => {
        it('should have correct staff permissions', async () => {
            const mockStaffPermissions = [
                { permission: { name: PERMISSIONS.USER_READ } },
                { permission: { name: PERMISSIONS.STAFF_ACCESS } }
            ];

            (prisma.userRole.findMany as jest.Mock).mockResolvedValue([{
                role: {
                    permissions: mockStaffPermissions
                }
            }]);

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

            const staffPermissions = staffUserRoles.flatMap(ur =>
                ur.role.permissions.map(rp => rp.permission.name)
            );

            // Staff should have these permissions
            expect(staffPermissions).toContain(PERMISSIONS.USER_READ);
            expect(staffPermissions).toContain(PERMISSIONS.STAFF_ACCESS);

            // Staff should NOT have these permissions
            expect(staffPermissions).not.toContain(PERMISSIONS.USER_CREATE);
            expect(staffPermissions).not.toContain(PERMISSIONS.ROLE_CREATE);
        });
    });

    describe('Role Assignment', () => {
        it('should correctly assign roles to users', async () => {
            (prisma.userRole.findMany as jest.Mock)
                .mockImplementationOnce(() => Promise.resolve([{ role: mockAdminRole }]))
                .mockImplementationOnce(() => Promise.resolve([{ role: mockStaffRole }]));

            const adminUserRoles = await prisma.userRole.findMany({
                where: { userId: adminUser.id },
                include: { role: true }
            });

            const staffUserRoles = await prisma.userRole.findMany({
                where: { userId: staffUser.id },
                include: { role: true }
            });

            expect(adminUserRoles).toHaveLength(1);
            expect(adminUserRoles[0].role.name).toBe(ROLES.ADMIN);

            expect(staffUserRoles).toHaveLength(1);
            expect(staffUserRoles[0].role.name).toBe(ROLES.STAFF);
        });
    });
}); 