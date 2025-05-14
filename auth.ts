import { prisma } from "@/lib/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { assignRoleToUser } from "@/lib/auth/setup-roles";
import { ROLES } from "@/lib/constants/roles";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";
import type { User, Prisma, ActionType } from "@/generated/prisma";

// Define types for our custom user data
type CustomUser = User & {
  profile?: {
    fullName: string | null;
    email: string;
  } | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers: [
    MicrosoftEntraID({
      clientId: process.env["AUTH_MICROSOFT_ENTRA_ID_ID"],
      clientSecret: process.env["AUTH_MICROSOFT_ENTRA_ID_SECRET"],
      issuer: process.env["AUTH_MICROSOFT_ENTRA_ID_TENANT_ID"],
      profilePhotoSize: 96,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          response_type: "code",
          response_mode: "query"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
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
          if (user?.id) {
            await prisma.auditLog.create({
              data: {
                action: 'LOGIN' as ActionType,
                entityType: 'User',
                entityId: user.id,
                data: {
                  email: credentials.email,
                  timestamp: new Date(),
                  status: 'failed',
                },
              },
            });
          }
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) {
          await prisma.auditLog.create({
            data: {
              action: 'LOGIN' as ActionType,
              entityType: 'User',
              entityId: user.id,
              data: {
                email: credentials.email,
                timestamp: new Date(),
                status: 'failed',
              },
            },
          });
          return null;
        }

        await prisma.auditLog.create({
          data: {
            action: 'LOGIN' as ActionType,
            entityType: 'User',
            entityId: user.id,
            data: {
              email: credentials.email,
              timestamp: new Date(),
              status: 'success',
            },
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName || null,
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  events: {
    createUser: async ({ user }) => {
      if (user.id) {
        await assignRoleToUser(user.id, ROLES.STAFF);
        await prisma.auditLog.create({
          data: {
            action: 'CREATE' as ActionType,
            entityType: 'User',
            entityId: user.id,
            data: {
              email: user.email,
              timestamp: new Date(),
            },
          },
        });
      }
    },
    signOut: async ({ session, token }: { session?: any; token?: any }) => {
      if (token?.sub) {
        await prisma.auditLog.create({
          data: {
            action: 'LOGOUT' as ActionType,
            entityType: 'User',
            entityId: token.sub,
            data: {
              timestamp: new Date(),
            },
          },
        });
      }
    },
  },
  callbacks: {
    async session({ session, token }) {
      console.log('Auth Debug - Session Callback:', {
        sessionExists: !!session,
        tokenExists: !!token,
        tokenSub: token?.sub,
        sessionUser: session?.user ? {
          email: session.user.email,
          name: session.user.name,
          id: session.user.id
        } : null
      });

      if (session?.user) {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: token.sub },
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

        await prisma.user.update({
          where: { id: token.sub },
          data: { lastLoginAt: new Date() },
        });

        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
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
    async jwt({ token, user, account }) {
      console.log('Auth Debug - JWT Callback:', {
        tokenExists: !!token,
        userExists: !!user,
        accountExists: !!account,
        accountProvider: account?.provider,
        tokenSub: token?.sub
      });

      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env["AUTH_SECRET"],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
});