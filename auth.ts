import NextAuth from "next-auth"
import type { DefaultSession, NextAuthConfig, Session } from "next-auth"
import type { JWT } from "@auth/core/jwt"
import type { AdapterSession } from "@auth/core/adapters"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma as defaultPrisma } from "./src/lib/prisma"
import type { PrismaClient } from "@/generated/prisma"

// Extend the built-in session types
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            roles?: string[]
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        roles?: string[]
        email: string
        name?: string | null
        image?: string | null
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string
        roles?: string[]
        idToken?: string
        name?: string | null
        email?: string | null
        picture?: string | null
        sub?: string
    }
}

export const createConfig = (prisma: PrismaClient = defaultPrisma) => ({
    adapter: PrismaAdapter(prisma),
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
            profilePhotoSize: 96,
            authorization: {
                params: {
                    scope: "openid profile email",
                    response_type: "code",
                    response_mode: "query",
                }
            },
        })
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        jwt: async ({ token, user, account }) => {
            if (account && user) {
                return {
                    ...token,
                    id: user.id,
                    roles: user.roles,
                    idToken: account.id_token,
                }
            }
            return token
        },
        session: ({ session, token }): Session => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    roles: token.roles,
                }
            }
        },
        authorized: ({ auth, request: { nextUrl } }) => {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard) {
                return isLoggedIn
            }

            // For non-dashboard routes, allow public access
            return true
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 60 * 60, // 1 hour
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            // Create or update the user first
            const dbUser = await prisma.user.upsert({
                where: { id: user.id },
                create: {
                    id: user.id,
                    email: user.email,
                    emailVerified: new Date(),
                    lastLoginAt: new Date(),
                    status: 'ACTIVE',
                },
                update: {
                    lastLoginAt: new Date(),
                },
            })

            // Create audit log for sign in
            await prisma.auditLog.create({
                data: {
                    action: "LOGIN",
                    entityType: "User",
                    entityId: dbUser.id,
                    userId: dbUser.id,
                    data: {
                        isNewUser,
                        provider: account?.provider,
                        email: dbUser.email,
                    },
                }
            })

            // If this is a new user, create their profile
            if (isNewUser) {
                await prisma.profile.create({
                    data: {
                        userId: dbUser.id,
                        fullName: profile?.name || user.email?.split('@')[0] || 'Unknown',
                        email: dbUser.email,
                        image: user.image,
                    }
                })
            }
        },
        async signOut(message) {
            if ('token' in message && message.token?.id) {
                // Get the user from the database
                const dbUser = await prisma.user.findUnique({
                    where: { id: message.token.id }
                })

                if (dbUser) {
                    await prisma.auditLog.create({
                        data: {
                            action: "LOGOUT",
                            entityType: "User",
                            entityId: dbUser.id,
                            userId: dbUser.id,
                            data: {
                                email: dbUser.email,
                            }
                        }
                    })
                }
            }
        },
    },
}) satisfies NextAuthConfig

export const config = createConfig()
export const { handlers, signIn, signOut, auth } = NextAuth(config) 