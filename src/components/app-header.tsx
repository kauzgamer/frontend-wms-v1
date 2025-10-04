import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, UserRound, LogOut, User, Settings } from "lucide-react"
import { useAuth } from '@/lib/use-auth'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/lib/hooks/use-organization'

export type AppHeaderProps = { online?: boolean }

export function AppHeader({ online = true }: AppHeaderProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { data: org, isLoading } = useOrganization()
  
  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
  <span className="text-sm font-medium" style={{ color: '#29b6c5' }} title={org?.codigo ? `Código: ${org.codigo}` : undefined}>
    WMS - {isLoading ? 'Carregando...' : (org?.nome ?? '')}
  </span>

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
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid leading-tight">
                <span className="text-sm font-medium">{user?.name || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground">{user?.email || 'email@exemplo.com'}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate('/settings/profile'); }}>
              <User className="size-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate('/settings/account'); }}>
              <Settings className="size-4" /> Configurações da Conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={(e) => { e.preventDefault(); handleLogout(); }}>
              <LogOut className="size-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
