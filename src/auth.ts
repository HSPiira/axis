import { prisma } from "@/lib/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { assignRoleToUser } from "@/lib/auth/setup-roles";
import { ROLES } from "@/lib/constants/roles";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        MicrosoftEntraID({
            clientId: process.env["AUTH_MICROSOFT_ENTRA_ID_ID"],
            clientSecret: process.env["AUTH_MICROSOFT_ENTRA_ID_SECRET"],
            issuer: process.env["AUTH_MICROSOFT_ENTRA_ID_TENANT_ID"],
            profilePhotoSize: 96,
            authorization: {
                defaultScopes: ["openid", "profile", "email"],
            },
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const user = {
                    id: "1",
                    name: "John Doe",
                    email: "test@test.com",
                    password: "password",
                };
                if (user.email === credentials?.email && user.password === credentials?.password) {
                    return user;
                }
                return null;
            },
        }),
    ],
    events: {
        createUser: async ({ user }) => {
            if (user.id) {
                // Assign staff role to new users
                await assignRoleToUser(user.id, ROLES.STAFF);
            }
        },
    },
    callbacks: {
        async session({ session, user }) {
            if (session?.user) {
                // Add user's roles to the session
                const userRoles = await prisma.userRole.findMany({
                    where: { userId: user.id },
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

                return {
                    ...session,
                    user: {
                        ...session.user,
                        id: user.id,
                        roles: userRoles.map(ur => ({
                            id: ur.role.id,
                            name: ur.role.name,
                            permissions: ur.role.permissions.map(rp => ({
                                id: rp.permission.id,
                                name: rp.permission.name
                            }))
                        }))
                    }
                };
            }
            return session;
        },
    },
    secret: process.env["AUTH_SECRET"],
    pages: {
        signIn: '/login',
    },
}); 