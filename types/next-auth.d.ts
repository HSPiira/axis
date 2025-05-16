import type { DefaultSession } from "next-auth"
import type { UserStatus } from "@prisma/client"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            status?: UserStatus
            access_token?: string
        } & DefaultSession["user"]
    }

    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
        status?: UserStatus
    }

    /**
     * Usually contains information about the provider being used
     * and also extends `TokenSet`, which is different tokens returned by OAuth providers.
     */
    interface Account {
        access_token?: string
    }

    /**
     * The JWT payload.
     */
    interface JWT {
        access_token?: string
    }
} 