import NextAuth from "next-auth"
import type { DefaultSession, NextAuthConfig, Session } from "next-auth"
import type { JWT } from "@auth/core/jwt"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

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

export const config = {
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
                if (isLoggedIn) return true
                return false
            }
            return true
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 60 * 60, // 1 hour
    },
    events: {
        async signIn({ user }) {
            // TODO: Implement audit logging here once DB is set up
            console.log("User signed in:", { userId: user.id })
        },
        async signOut(params) {
            if ('token' in params && params.token) {
                console.log("User signed out:", { userId: params.token.id })
            }
        },
    },
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(config) 