// app/(dashboard)/page.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>

            {/* Table/List skeleton */}
            <div className="bg-card rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
