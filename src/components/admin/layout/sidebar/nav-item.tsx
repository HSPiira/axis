import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { MenuItem } from "@/types"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NavItem = ({ icon: Icon, title, href }: MenuItem) => {
    const pathname = usePathname()

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    href={href}
                    className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-accent ${pathname === href ? "bg-accent" : ""
                        }`}
                    aria-current={pathname === href ? "page" : undefined}
                >
                    {Icon && <Icon className="h-5 w-5 text-foreground" />}
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{title}</TooltipContent>
        </Tooltip>
    )
}

export default NavItem;