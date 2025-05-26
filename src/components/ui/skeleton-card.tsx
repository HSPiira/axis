import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export function SkeletonCard() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-3 w-[150px]" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <Skeleton className="h-3 w-[50px]" />
                        <Skeleton className="h-3 w-[100px]" />
                    </div>
                </div>
            ))}
        </div>
    )
} 