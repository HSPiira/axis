import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
                    <p className="text-gray-500">
                        There was a problem authenticating your account.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Button asChild>
                        <Link href="/auth/signin">Try Again</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
} 