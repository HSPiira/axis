import { Button, ThemeToggle } from "@/components/ui";
import { Bell, LogIn, LogOut, MessageCircle } from "lucide-react";

export function AdminHeader({ title }: { title: string }) {
    return (
        <header className="h-16 border-b flex items-center justify-between px-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <MessageCircle size={24} />
                </Button>
                <Button variant="ghost" size="icon">
                    <Bell size={24} />
                </Button>
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                    <LogIn size={24} />
                </Button>
            </div>
        </header>
    )
}