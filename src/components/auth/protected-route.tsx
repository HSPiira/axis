import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

export default async function ProtectedRoute({
    children,
}: {
    children: ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    return <>{children}</>
} 