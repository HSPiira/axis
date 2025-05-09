# Care - Healthcare Management System

A modern healthcare management system built with Next.js, Xata (PostgreSQL), and NextAuth.js.

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Xata account)
- Git

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Xata (PostgreSQL)
- **Authentication**: NextAuth.js 5
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Package Manager**: pnpm

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd care
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

   # Authentication (NextAuth.js)
   AUTH_SECRET="your-auth-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # Xata (if using Xata)
   XATA_API_KEY="your-xata-api-key"
   ```

4. Initialize the database:
   ```bash
   # If using Xata
   pnpm xata init
   pnpm xata pull dev

   # Seed the database with initial data
   pnpm tsx prisma/xata-seed.ts
   ```

5. Set up RBAC (Role-Based Access Control):
   ```bash
   # Initialize roles and permissions
   pnpm tsx scripts/setup-rbac.ts
   ```

6. Run the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
care/
├── src/                    # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions and configurations
│   │   ├── auth/        # Authentication and RBAC setup
│   │   └── constants/   # System constants including roles and permissions
│   └── xata.ts           # Xata client configuration
├── prisma/                # Database schema and migrations
│   ├── xata-seed.ts      # Database seeding script
│   └── permissions.json  # Initial permissions data
├── scripts/              # Utility scripts
│   └── setup-rbac.ts    # RBAC initialization script
├── public/               # Static assets
└── .xata/               # Xata configuration
```

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm tsx scripts/setup-rbac.ts` - Initialize RBAC system

## Role-Based Access Control (RBAC)

The application uses a comprehensive RBAC system to manage user permissions.

### Available Roles

- **Admin**: Full system access
- **Manager**: Extensive access with some restrictions
- **Staff**: Basic operational access
- **Viewer**: Read-only access
- **Support**: Customer support operations
- **Auditor**: Compliance and audit operations

### Permission Categories

1. **User Management**
   - Create, read, update, delete users
   - Import/export user data
   - Suspend/reactivate users

2. **Role Management**
   - Create, read, update, delete roles
   - Assign/revoke roles

3. **Document Management**
   - Create, read, update, delete documents
   - Version control
   - Share, archive, restore

4. **Messaging**
   - Create, read, update, delete messages
   - Archive, pin, forward, broadcast

5. **Notes**
   - Create, read, update, delete notes
   - Share, archive, restore, export

6. **Resources**
   - Create, read, update, delete resources
   - Share, approve, reject, archive

7. **Analytics**
   - Read analytics
   - Export reports
   - Custom analytics
   - Schedule reports

8. **Settings**
   - Read/update settings
   - Advanced settings
   - Security settings
   - Integration settings

9. **Audit & Compliance**
   - Read/export audit logs
   - Review compliance
   - Approve compliance changes

10. **Support & Help**
    - Access support features
    - Manage support tickets
    - Resolve/assign issues

### Setting Up RBAC

1. The roles and permissions are defined in `src/lib/constants/roles.ts`
2. Run the setup script to initialize the RBAC system:
   ```bash
   pnpm tsx scripts/setup-rbac.ts
   ```
3. The script will:
   - Create all defined permissions
   - Create all roles
   - Assign appropriate permissions to each role

### Managing User Roles

To assign a role to a user programmatically:

```typescript
import { assignRoleToUser } from "@/lib/auth/setup-roles";

await assignRoleToUser(userId, "admin"); // or any other role
```

## Database Management

### Using Xata

1. Install Xata CLI:
   ```bash
   pnpm add -D @xata.io/cli
   ```

2. Initialize Xata:
   ```bash
   pnpm xata init
   ```

3. Pull schema changes:
   ```bash
   pnpm xata pull dev
   ```

### Seeding Data

To seed the database with initial permissions:
```bash
DATABASE_URL="your-database-url" pnpm tsx prisma/xata-seed.ts
```

## Authentication

The application uses NextAuth.js for authentication. Configure your authentication providers in the `.env.local` file and update the auth configuration in `auth.ts`.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Your License]
