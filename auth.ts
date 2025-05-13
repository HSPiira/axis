import { prisma } from "@/lib/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { assignRoleToUser } from "@/lib/auth/setup-roles";
import { ROLES } from "@/lib/constants/roles";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import type { User, Prisma } from "@/generated/prisma";

// Define types for our custom user data
type CustomUser = User & {
  profile?: {
    fullName: string | null;
    email: string;
  } | null;
};

// Create a custom adapter that extends the PrismaAdapter
const customPrismaAdapter = {
  ...PrismaAdapter(prisma as any), // Type assertion needed for compatibility
  createUser: async (data: any) => {
    // Create the user first
    const user = await prisma.user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified,
        password: data.password,
      },
    });

    // Create the profile with the user's name
    await prisma.profile.create({
      data: {
        fullName: data.name,
        email: data.email,
        image: data.image,
        userId: user.id,
      },
    });

    return user;
  },
} as Adapter;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customPrismaAdapter,
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            password: true,
            profile: {
              select: {
                fullName: true,
                email: true,
              }
            }
          }
        }) as CustomUser | null;

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName || null,
        };
      }
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
  trustHost: true,
});