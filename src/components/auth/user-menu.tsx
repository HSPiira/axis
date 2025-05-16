"use client"

import { signOut } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import Image from "next/image"

export function UserMenu() {
    const { data: session } = useSession()

    if (!session?.user) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    {session.user.image ? (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || ""}
                            fill
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {session.user.name?.[0] || session.user.email?.[0] || "?"}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    onClick={() => signOut({ redirectTo: "/auth/signin" })}
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 