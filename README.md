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

5. Run the development server:
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
│   └── xata.ts           # Xata client configuration
├── prisma/                # Database schema and migrations
│   ├── xata-seed.ts      # Database seeding script
│   └── permissions.json  # Initial permissions data
├── public/               # Static assets
└── .xata/               # Xata configuration
```

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

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
