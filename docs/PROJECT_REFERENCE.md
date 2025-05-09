# Project Reference Guide

## How to Use This Reference
This document serves as the single source of truth for project patterns, best practices, and standards. When working on this project:

1. **For AI Assistant (Claude)**:
   - Always check this document first before making any changes
   - Follow the patterns and best practices outlined here
   - Suggest updates to this document when introducing new patterns
   - Use the examples as templates for new code
   - Reference specific sections when explaining changes

2. **For Developers**:
   - Review this document before starting new features
   - Follow the established patterns
   - Update this document when introducing new patterns
   - Use the checklist for code reviews
   - Reference this document in PR descriptions

3. **When to Update**:
   - When introducing new patterns
   - When changing existing patterns
   - When adding new features
   - When fixing bugs that reveal new best practices
   - When upgrading dependencies

4. **Quick Reference**:
   - API Routes: See "API Route Patterns"
   - Database: See "Database Patterns"
   - Components: See "Component Patterns"
   - Refactoring: See "Page Refactoring Guidelines"
   - Best Practices: See "Best Practices"

## Project Overview
This is a Next.js 15 application using the App Router, with PostgreSQL database and Prisma ORM.

## Directory Structure
```
src/
├── app/                    # Next.js App Router directory
│   ├── (admin)/           # Admin routes group
│   │   └── settings/      # Settings pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
└── types/                 # TypeScript type definitions
```

## File Naming Conventions

### 1. File Types and Extensions
- React Components: `.tsx`
- TypeScript Files: `.ts`
- Style Files: `.css` or `.scss`
- Test Files: `.test.ts` or `.test.tsx`
- API Routes: `route.ts`

### 2. Naming Patterns
- Components: kebab-case (e.g., `user-profile.tsx`)
- Hooks: kebab-case with 'use' prefix (e.g., `use-auth.ts`)
- Utilities: kebab-case (e.g., `format-date.ts`)
- Constants: kebab-case (e.g., `api-endpoints.ts`)
- Types/Interfaces: kebab-case (e.g., `user-types.ts`)
- API Routes: `route.ts` in directory (e.g., `api/users/[id]/route.ts`)

### 3. Index Files
Every directory should have an `index.ts` file that:
- Exports all public components/functions
- Provides a clean public API
- Reduces import complexity

Example `index.ts`:
```typescript
// components/forms/index.ts
export { default as LoginForm } from './login-form';
export { default as RegistrationForm } from './registration-form';
export { useFormValidation } from './hooks';
export type { FormProps } from './types';
```

### 4. Directory Organization
```
components/
├── forms/
│   ├── login-form.tsx
│   ├── registration-form.tsx
│   ├── hooks/
│   │   ├── use-form-validation.ts
│   │   └── index.ts
│   ├── types.ts
│   └── index.ts
└── index.ts
```

### 5. Import Patterns
```typescript
// Good
import { LoginForm, RegistrationForm } from '@/components/forms';
import { useFormValidation } from '@/components/forms';

// Avoid
import { LoginForm } from '@/components/forms/login-form';
import { useFormValidation } from '@/components/forms/hooks/use-form-validation';
```

### 6. Index File Maintenance
- Keep index files up to date
- Export only what's needed
- Group related exports
- Add JSDoc comments for clarity
- Remove unused exports

### 7. Best Practices
- Use kebab-case for all file names
- Keep file names descriptive but concise
- Follow the established patterns
- Update index files when adding new components
- Maintain clean exports
- Use PascalCase for component names in code (not file names)

## Key Technologies
- Next.js 15 (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- Shadcn UI

## API Route Patterns

### Route Handler Structure
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function HTTP_METHOD(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Validate request
        const body = await request.json();
        
        // 2. Process request
        const result = await processRequest();
        
        // 3. Return response
        return NextResponse.json(result);
    } catch (error) {
        // Handle errors
        return handleError(error);
    }
}
```

### Error Handling Pattern
```typescript
function handleError(error: unknown) {
    console.error("Error:", error);

    if (error instanceof Error) {
        switch (error.message) {
            case "Not Found":
                return NextResponse.json(
                    { error: "Resource not found" },
                    { status: 404 }
                );
            case "Invalid Input":
                return NextResponse.json(
                    { error: "Invalid input" },
                    { status: 400 }
                );
            default:
                return NextResponse.json(
                    { error: "Internal server error" },
                    { status: 500 }
                );
        }
    }

    return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
    );
}
```

## Database Patterns

### Prisma Transaction Pattern
```typescript
const result = await prisma.$transaction(async (tx) => {
    // 1. Verify existence
    const existing = await tx.model.findUnique({
        where: { id },
        include: { relations: true }
    });

    if (!existing) {
        throw new Error("Not Found");
    }

    // 2. Perform operations
    return await tx.model.update({
        where: { id },
        data: { /* update data */ },
        include: { relations: true }
    });
});
```

## Component Patterns

### Server Component Pattern
```typescript
export default async function Page() {
    const data = await fetchData();
    return <Component data={data} />;
}
```

### Client Component Pattern
```typescript
'use client';

import { useState } from 'react';

export function ClientComponent() {
    const [state, setState] = useState();
    return <div>{/* component content */}</div>;
}
```

## Modal Patterns

### Base Modal Component
We use a custom Modal component (`src/components/ui/modal.tsx`) for consistent modal behavior across the application:

```tsx
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl";
}
```

Key features:
- Sticky behavior (only closes on explicit user action)
- Consistent styling and dark mode support
- Proper z-indexing and backdrop
- Accessible close button
- Optional footer for actions
- Configurable max width

### Modal Usage Pattern
```tsx
// Example of a modal implementation
const [isOpen, setIsOpen] = useState(false);

return (
    <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        footer={
            <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
            </>
        }
    >
        {/* Modal content */}
    </Modal>
);
```

## Tab Handling & Data Fetching

### Tab Management
We use a custom hook `useSettingsTab` for consistent tab handling across settings sections:

```tsx
// src/hooks/use-settings-tab.ts
'use client';

interface UseSettingsTabOptions {
    section: string;
    defaultTab: string;
}

export function useSettingsTab({ section, defaultTab }: UseSettingsTabOptions) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || defaultTab;

    // Ensure default tab is reflected in URL on initial load
    useEffect(() => {
        if (!searchParams.get('tab')) {
            router.push(`/settings?section=${section}&tab=${defaultTab}`);
        }
    }, []);

    const handleTabChange = (value: string) => {
        router.push(`/settings?section=${section}&tab=${value}`);
    };

    return { activeTab, handleTabChange };
}
```

### Data Loading Pattern
We use a custom hook `useSettingsData` to handle data loading for all tabs in a section:

```tsx
// src/hooks/use-settings-data.ts
'use client';

interface UseSettingsDataOptions {
    section: string;
    defaultTab: string;
    dataLoaders: {
        [key: string]: () => Promise<any>;
    };
}

export function useSettingsData({ section, defaultTab, dataLoaders }: UseSettingsDataOptions) {
    const { activeTab, handleTabChange } = useSettingsTab({ section, defaultTab });
    const [data, setData] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<{ [key: string]: Error | null }>({});

    // Load all data when component mounts
    useEffect(() => {
        const loadAllData = async () => {
            const loadPromises = Object.entries(dataLoaders).map(async ([tab, loader]) => {
                try {
                    setLoading(prev => ({ ...prev, [tab]: true }));
                    const result = await loader();
                    setData(prev => ({ ...prev, [tab]: result }));
                    setError(prev => ({ ...prev, [tab]: null }));
                } catch (err) {
                    setError(prev => ({ ...prev, [tab]: err as Error }));
                } finally {
                    setLoading(prev => ({ ...prev, [tab]: false }));
                }
            });

            await Promise.all(loadPromises);
        };

        loadAllData();
    }, []);

    return { activeTab, handleTabChange, data, loading, error };
}
```

### Usage Example
```tsx
// Example of a settings section component
'use client';

export function UserSettings() {
    const {
        activeTab,
        handleTabChange,
        data,
        loading,
        error
    } = useSettingsData({
        section: 'users',
        defaultTab: 'users',
        dataLoaders: {
            users: async () => {
                const response = await fetch('/api/users');
                if (!response.ok) throw new Error('Failed to fetch users');
                return response.json();
            },
            roles: async () => {
                const response = await fetch('/api/roles');
                if (!response.ok) throw new Error('Failed to fetch roles');
                return response.json();
            },
            // ... other data loaders
        }
    });

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
                {loading.users ? (
                    <div>Loading users...</div>
                ) : error.users ? (
                    <div>Error: {error.users.message}</div>
                ) : (
                    <UsersTable users={data.users} />
                )}
            </TabsContent>

            <TabsContent value="roles">
                {loading.roles ? (
                    <div>Loading roles...</div>
                ) : error.roles ? (
                    <div>Error: {error.roles.message}</div>
                ) : (
                    <RolesTable roles={data.roles} />
                )}
            </TabsContent>
        </Tabs>
    );
}
```

Key benefits of this pattern:
1. All data is loaded when the component mounts, providing instant tab switching
2. Consistent loading and error states across all tabs
3. URL-based tab state for bookmarking and sharing
4. Type-safe data loading with TypeScript
5. Centralized data fetching logic
6. Proper error handling for each data source

## Route Handlers

### API Route Structure
API routes should follow this structure:

```typescript
// app/api/[resource]/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch data
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Create resource
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
```

### Resource-specific Routes
For resource-specific operations:

```typescript
// app/api/[resource]/[id]/route.ts
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Fetch single resource
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Not Found' },
            { status: 404 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        // Update resource
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
```

## Data Fetching

### Client-side Data Fetching
For client-side data fetching, use the `fetch` API with proper error handling:

```typescript
const fetchData = async () => {
    try {
        const response = await fetch('/api/resource');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
```

### Server-side Data Fetching
For server components, use async/await with proper error handling:

```typescript
async function getData() {
    try {
        const response = await fetch('https://api.example.com/data', {
            next: { revalidate: 3600 } // Revalidate every hour
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
```

### Database Operations
For database operations, use Prisma with transactions when needed:

```typescript
import { prisma } from '@/lib/prisma';

async function updateWithTransaction() {
    return await prisma.$transaction(async (tx) => {
        // Perform multiple operations
        const result1 = await tx.model1.update({ ... });
        const result2 = await tx.model2.create({ ... });
        return { result1, result2 };
    });
}
```

## Page Refactoring Guidelines

### 1. Component Organization
- Break down large pages into smaller, reusable components
- Keep page components focused on layout and data fetching
- Move complex logic into custom hooks
- Extract repeated patterns into shared components

### 2. Data Fetching
- Use Server Components for data fetching when possible
- Implement proper loading states
- Handle errors gracefully
- Cache data appropriately

### 3. State Management
- Keep state as local as possible
- Use React Context for global state
- Implement proper state initialization
- Handle state updates efficiently

### 4. Performance Optimization
- Implement proper code splitting
- Use dynamic imports for large components
- Optimize images and assets
- Implement proper caching strategies

### 5. Refactoring Checklist
- [ ] Break down large components
- [ ] Extract reusable logic into hooks
- [ ] Implement proper error boundaries
- [ ] Add loading states
- [ ] Optimize performance
- [ ] Add proper TypeScript types
- [ ] Update documentation
- [ ] Add necessary tests

### 6. Code Quality
- Follow consistent naming conventions
- Implement proper prop types
- Add JSDoc comments for complex logic
- Keep components pure when possible
- Implement proper error handling

### 7. Testing
- Add unit tests for components
- Implement integration tests
- Test error scenarios
- Verify loading states
- Test edge cases

## Best Practices

### 1. API Routes
- Always use `NextRequest` and `NextResponse`
- Implement proper error handling
- Use transactions for database operations
- Validate request data
- Return consistent response formats

### 2. Database Operations
- Use transactions for related operations
- Include necessary relations in queries
- Handle database errors appropriately
- Use proper indexing for performance

### 3. Type Safety
- Define proper TypeScript interfaces
- Use type guards where necessary
- Avoid using `any` type
- Leverage Prisma's generated types

### 4. Error Handling
- Use specific error messages
- Implement proper error boundaries
- Log errors appropriately
- Return meaningful error responses

### 5. Performance
- Use proper caching strategies
- Implement pagination for large datasets
- Optimize database queries
- Use proper loading states

## Environment Variables
Required environment variables:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=...
```

## Common Commands
```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Database
npx prisma db push #xata migration of local db changes
npx prisma db pull #to update the local db with the cloud db
pnpm prisma generate
#pnpm prisma migrate dev
```

## How to Update This Document
1. Keep this document in sync with project changes
2. Add new patterns as they emerge
3. Update best practices based on team decisions
4. Document any breaking changes
5. Include examples for new features

## Contributing
When adding new features or making changes:
1. Follow the established patterns
2. Update this document if introducing new patterns
3. Ensure type safety
4. Add proper error handling
5. Include necessary tests

## Table Patterns

### Table with Detail Card
Tables that show detail cards on row selection should follow this pattern:

```tsx
interface TableProps {
    data: Item[];
    onAction: (item: Item) => void;
}

export function TableWithDetailCard({ data, onAction }: TableProps) {
    const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

    return (
        <div className="flex items-start gap-4">
            <div className="flex-1 rounded-md border overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            {/* Headers with whitespace-nowrap */}
                            <th className="h-10 px-3 text-left font-medium whitespace-nowrap">Column</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                className={`border-b cursor-pointer hover:bg-muted/50 ${
                                    selectedItem?.id === item.id ? 'bg-muted/50' : ''
                                }`}
                                onClick={() => setSelectedItem(
                                    selectedItem?.id === item.id ? null : item
                                )}
                            >
                                <td className="p-2 whitespace-nowrap">{item.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedItem && (
                <DetailCard
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAction={() => onAction(selectedItem)}
                />
            )}
        </div>
    );
}
```

Key features:
1. Row selection toggles the detail card (clicking selected row hides card)
2. Visual feedback for selected row
3. Proper overflow handling
4. Consistent spacing and layout

### Table Pagination
All tables should implement pagination following this pattern:

```tsx
interface PaginatedTableProps {
    data: Item[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginatedTable({ 
    data, 
    currentPage, 
    totalPages, 
    onPageChange 
}: PaginatedTableProps) {
    const pageSize = 10;
    const paginatedData = data.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-xs">
                    {/* Table content */}
                </table>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

Key features:
1. Consistent page size (10 items per page)
2. Page navigation controls
3. Entry count display
4. Proper disabled states
5. Responsive layout

### Table Best Practices

1. **Text Handling**
   - Use `whitespace-nowrap` for columns that shouldn't wrap
   - Use `truncate` with `max-w-[...]` for long text
   - Add `title` attribute for truncated text
   ```tsx
   <td className="p-2">
       <div className="truncate max-w-[200px]" title={longText}>
           {longText}
       </div>
   </td>
   ```

2. **Responsive Design**
   - Wrap table in `overflow-x-auto` container
   - Use consistent text sizes
   - Maintain proper spacing
   ```tsx
   <div className="overflow-x-auto">
       <table className="w-full text-xs">
           {/* Table content */}
       </table>
   </div>
   ```

3. **Selection States**
   - Clear visual feedback for selected rows
   - Toggle selection on click
   - Proper hover states
   ```tsx
   <tr
       className={`cursor-pointer hover:bg-muted/50 ${
           isSelected ? 'bg-muted/50' : ''
       }`}
       onClick={() => onSelect(item)}
   >
   ```

4. **Action Buttons**
   - Use tooltips for icon buttons
   - Prevent event propagation
   - Consistent styling
   ```tsx
   <Button
       size="icon"
       variant="outline"
       onClick={(e) => {
           e.stopPropagation();
           onAction(item);
       }}
   >
   ```

5. **Loading States**
   - Show loading indicators
   - Disable interactions
   - Maintain layout
   ```tsx
   {isLoading ? (
       <div className="flex items-center justify-center p-4">
           <Spinner className="h-6 w-6" />
       </div>
   ) : (
       <table>{/* Table content */}</table>
   )}
   ```

6. **Empty States**
   - Clear empty state message
   - Optional action button
   - Consistent styling
   ```tsx
   {data.length === 0 ? (
       <div className="text-center p-4 text-muted-foreground">
           No items found
           {onAdd && (
               <Button onClick={onAdd} className="mt-2">
                   Add Item
               </Button>
           )}
       </div>
   ) : (
       <table>{/* Table content */}</table>
   )}
   ``` 