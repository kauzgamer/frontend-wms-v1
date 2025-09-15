import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Smartphone, Printer, Search, Bell, SunMedium, Settings } from "lucide-react"
import QRCode from "react-qr-code"

export default function Page() {
  const userName = "Luimá Almeida"
  const orgName = "WMS - INDUSTRIA E COM SANTA MARIA LTDA"
  const qrValue = "wms://setup?org=1&env=prod"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 hidden sm:block data-[orientation=vertical]:h-4" />

          {/* Busca */}
          <div className="flex w-full max-w-xl items-center gap-2">
            <div className="bg-background ring-border/60 text-muted-foreground focus-within:ring-ring/60 relative flex w-full items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition focus-within:ring-2">
              <Search className="size-4" />
              <input
                placeholder="Search..."
                className="placeholder:text-muted-foreground/70 text-foreground w-full bg-transparent outline-none"
              />
              <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
            </div>
          </div>

          {/* Ações à direita */}
          <div className="ml-auto flex items-center gap-4 pl-2">
            <span className="bg-red-500 inline-block size-2 rounded-full" aria-hidden />
            <button aria-label="Notificações" className="text-foreground/80 hover:text-foreground transition">
              <Bell className="size-5" />
            </button>
            <button aria-label="Tema" className="text-foreground/80 hover:text-foreground transition">
              <SunMedium className="size-5" />
            </button>
            <button aria-label="Configurações" className="text-foreground/80 hover:text-foreground transition">
              <Settings className="size-5" />
            </button>
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <Avatar className="size-8">
              <AvatarImage src="https://i.pravatar.cc/64" alt={userName} />
              <AvatarFallback>LA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
          {/* Saudação no conteúdo (não no header) */}
          <div>
            <span className="text-sm text-muted-foreground">{orgName}</span>
            <h1 className="text-2xl font-semibold leading-tight">Olá, {userName}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">Integração Nativa</Badge>
              <Badge variant="success">Online</Badge>
            </div>
          </div>
          <div className="max-w-xl">
            <Card>
              <CardHeader>
                <CardTitle>Aplicativo WMS</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure o aplicativo móvel ou coletor de dados com o código abaixo:
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-6">
                  <div className="bg-white p-3 rounded-md">
                    <QRCode value={qrValue} size={144} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <a href="#" className="text-primary inline-flex items-center gap-2">
                  <Smartphone className="size-4" /> Google Play
                </a>
                <button className="text-primary inline-flex items-center gap-2">
                  <Printer className="size-4" /> Imprimir
                </button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
