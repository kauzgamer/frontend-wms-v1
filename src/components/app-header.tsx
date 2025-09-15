import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

export type AppHeaderProps = { online?: boolean }

export function AppHeader({ online = true }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
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
      </div>
    </header>
  )
}
