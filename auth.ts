import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { UserStatus } from "@/generated/prisma"
import type { NextAuthConfig } from "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `auth`, contains information about the active session.
     */
    interface Session {
        user: {
            id: string
            roles?: string[]
        } & DefaultSession["user"]
    }

    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
        status?: UserStatus
        access_token?: string
        roles?: string[]
    }
}

declare module "@auth/core/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        idToken?: string
        /** User's roles in the system */
        roles?: string[]
        /** User's unique identifier */
        id: string
        /** User's name */
        name?: string | null
        /** User's email */
        email?: string | null
        /** User's profile picture */
        picture?: string | null
        /** Subject identifier */
        sub?: string
        /** Access token */
        access_token?: string
    }
}

// Configure Auth.js with custom session handling
export const createConfig = (prismaClient = prisma): NextAuthConfig => ({
    adapter: PrismaAdapter(prismaClient),
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
            authorization: { params: { scope: "openid profile email" } },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // Update user's last login time and ensure active status
            await prismaClient.user.upsert({
                where: { id: user.id },
                create: {
                    id: user.id,
                    email: user.email ?? "",
                    emailVerified: new Date(),
                    status: "ACTIVE" as UserStatus,
                    lastLoginAt: new Date(),
                },
                update: {
                    lastLoginAt: new Date(),
                    status: "ACTIVE" as UserStatus,
                },
            })

            // Create audit log for sign in
            await prismaClient.auditLog.create({
                data: {
                    action: "LOGIN",
                    entityType: "User",
                    entityId: user.id,
                    userId: user.id,
                    data: {
                        email: user.email,
                    },
                },
            })

            return true
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub
                const dbUser = await prismaClient.user.findUnique({
                    where: { id: token.sub },
                    select: { status: true },
                })
                if (dbUser?.status) {
                    session.user.status = dbUser.status
                }
                if (token.access_token) {
                    session.user.access_token = token.access_token
                }
            }
            return session
        },
        async jwt({ token, account }) {
            if (account?.access_token) {
                token.access_token = account.access_token
            }
            return token
        },
        async authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = request.nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard) {
                return isLoggedIn
            }

            // For non-dashboard routes, allow public access
            return true
        },
    },
    pages: {
        signIn: "/signin",
    },
    session: {
        strategy: "jwt",
    },
})

const config = createConfig()
export const { handlers, auth, signIn, signOut } = NextAuth(config)

// Helper function to log user logout
export async function auditUserLogout(userId: string, email?: string | null) {
    await prisma.auditLog.create({
        data: {
            action: "LOGOUT",
            entityType: "User",
            entityId: userId,
            userId: userId,
            data: {
                email,
            },
        },
    })
} 