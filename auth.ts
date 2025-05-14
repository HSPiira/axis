import NextAuth from "next-auth"
import type { DefaultSession, NextAuthConfig } from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

export const config = {
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            issuer: process.env.AZURE_AD_ISSUER,
            authorization: { params: { scope: "openid profile email" } },
        })
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        session: ({ session, token }) => ({
            ...session,
            user: {
                ...session.user,
                id: token.sub,
            },
        }),
    },
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(config) 