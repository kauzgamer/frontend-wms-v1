import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, UserRound, Sparkles, CreditCard, LogOut, User } from "lucide-react"

export type AppHeaderProps = { online?: boolean }

export function AppHeader({ online = true }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <Separator orientation="vertical" className="mr-2 hidden sm:block data-[orientation=vertical]:h-4" />

      <div className="ml-auto flex items-center gap-3">
        {online ? (
          <Badge variant="success">Online</Badge>
        ) : (
          <Badge variant="outline">Offline</Badge>
        )}
        <span className="bg-red-500 inline-block size-2 rounded-full" aria-hidden />
        <button aria-label="Notificações" className="text-foreground/80 hover:text-foreground transition">
          <Bell className="size-5" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Usuário"
              className="text-foreground/80 hover:text-foreground transition rounded-full p-1.5 border border-transparent hover:border-border"
            >
              <UserRound className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="size-8">
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="grid leading-tight">
                <span className="text-sm font-medium">shadcn</span>
                <span className="text-xs text-muted-foreground">m@example.com</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Sparkles className="size-4" /> Upgrade to Pro
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="size-4" /> Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="size-4" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="size-4" /> Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
