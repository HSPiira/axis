import ProtectedRoute from "@/components/auth/protected-route"
import { UserMenu } from "@/components/auth/user-menu"

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <UserMenu />
                </header>
                <main className="p-6">
                    <div className="rounded-lg border bg-white p-6">
                        <h2 className="text-lg font-medium">Welcome to your dashboard!</h2>
                        <p className="mt-2 text-gray-600">
                            This is a protected page. You can only see this if you're authenticated.
                        </p>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
} 