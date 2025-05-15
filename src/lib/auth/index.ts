import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { UserStatus } from "@/generated/prisma"
import type { NextAuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { DefaultSession, Session } from "next-auth"

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

export const createConfig = (prismaClient = prisma): NextAuthConfig => ({
    adapter: PrismaAdapter(prismaClient),
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
        }),
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Update user's last login time and ensure active status
            await prismaClient.user.upsert({
                where: { id: user.id },
                create: {
                    id: user.id,
                    email: user.email ?? "",
                    status: 'ACTIVE' as UserStatus,
                    emailVerified: null,
                    lastLoginAt: new Date(),
                },
                update: {
                    lastLoginAt: new Date(),
                },
            })

            // Create audit log for login
            await prismaClient.auditLog.create({
                data: {
                    action: "LOGIN",
                    entityType: "User",
                    entityId: user.id,
                    userId: user.id,
                    data: {
                        provider: account?.provider,
                        email: user.email,
                    },
                },
            })

            // Create profile for new users if it doesn't exist
            const existingProfile = await prismaClient.profile.findUnique({
                where: { userId: user.id },
            })

            if (!existingProfile) {
                await prismaClient.profile.create({
                    data: {
                        userId: user.id,
                        fullName: user.name ?? "",
                        email: user.email ?? null,
                        image: user.image ?? null,
                    },
                })
            }

            return true
        },

        async signOut({ token }) {
            const dbUser = await prismaClient.user.findUnique({
                where: { id: token.id },
            })

            if (dbUser) {
                await prismaClient.auditLog.create({
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

            return true
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string
                session.user.roles = token.roles as string[]
            }
            return session
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
            }
            return token
        },

        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = request.nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard) {
                return isLoggedIn
            }

            // For non-dashboard routes, allow public access
            return true
        },

        // Handle redirect URLs properly
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
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
            const dbUser = await prismaClient.user.upsert({
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
            await prismaClient.auditLog.create({
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
                await prismaClient.profile.create({
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
                const dbUser = await prismaClient.user.findUnique({
                    where: { id: message.token.id }
                })

                if (dbUser) {
                    await prismaClient.auditLog.create({
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
})

export const { auth, handlers, signIn, signOut } = NextAuth(createConfig()) 