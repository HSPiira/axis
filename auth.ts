import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";


export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        MicrosoftEntraID({
            ...({
                clientId: process.env['AUTH_AZURE_AD_ID'],
                clientSecret: process.env['AUTH_AZURE_AD_SECRET'],
                tenantId: process.env['AUTH_AZURE_AD_TENANT_ID'],
                authorizationUrl: `https://login.microsoftonline.com/${process.env['AUTH_AZURE_AD_TENANT_ID']}/oauth2/v2.0/authorize`,
                tokenUrl: `https://login.microsoftonline.com/${process.env['AUTH_AZURE_AD_TENANT_ID']}/oauth2/v2.0/token`,
                profilePhotoSize: 96,
            } as any),
        }),
    ],
})