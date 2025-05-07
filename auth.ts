import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env["AUTH_AZURE_AD_ID"],
      clientSecret: process.env["AUTH_AZURE_AD_SECRET"],
      issuer: process.env["AUTH_AZURE_AD_TENANT_ID"],
      profilePhotoSize: 96,

      authorization: {
        defaultScopes: ["openid", "profile", "email"],
      },
    }),
  ],
});
