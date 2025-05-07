
export function AdminHeader({ title }: { title: string }) {
    return (
        <header className="bg-background">
            <h1 className="text-2xl font-bold">{title}</h1>
        </header>
    )
}