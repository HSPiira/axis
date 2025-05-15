import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

interface ErrorMessages {
    [key: string]: string;
}

const errorMessages: ErrorMessages = {
    'Configuration': 'There is a problem with the server configuration.',
    'AccessDenied': 'You do not have permission to sign in.',
    'Verification': 'The sign in link is no longer valid.',
    'Default': 'There was a problem signing you in.',
    'RateLimit': 'Too many sign in attempts. Please try again later.',
}

export default function AuthErrorPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    const error = searchParams.error
    const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-black dark:to-gray-900">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-red-200 dark:border-red-900 bg-white/80 dark:bg-black/50 backdrop-blur-xl p-8 shadow-lg">
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {errorMessage}
                    </p>
                </div>
                <div className="flex justify-center space-x-4">
                    <Button variant="outline" asChild>
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/auth/signin">Try Again</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
} 