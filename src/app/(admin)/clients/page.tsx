// app/(dashboard)/page.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            {/* Search/Filter skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-64 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
            </div>

            {/* Table/List skeleton */}
            <div className="bg-card rounded-lg p-4">
                {/* Table header skeleton */}
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                </div>
                {/* Table rows skeleton */}
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
