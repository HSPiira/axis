import { prisma } from "@/lib/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

// Create a type-safe adapter
const adapter = PrismaAdapter(prisma as unknown as PrismaClient);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
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
  secret: process.env["AUTH_SECRET"],
  pages: {
    signIn: '/login', // Custom sign-in page path
  },
});
