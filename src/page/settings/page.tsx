import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Card } from "@/components/ui/card"

export function SettingsPage() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="p-4 md:p-6 space-y-4">
          <h1 className="text-xl font-semibold text-sidebar-accent-foreground">Configurações</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card className="p-4">
              <h2 className="text-sm font-medium mb-2">Preferências</h2>
              <p className="text-sm text-sidebar-foreground/80">Idioma, tema e outras preferências da interface.</p>
            </Card>
            <Card className="p-4">
              <h2 className="text-sm font-medium mb-2">Integrações</h2>
              <p className="text-sm text-sidebar-foreground/80">Gerencie conexões com serviços externos.</p>
            </Card>
            <Card className="p-4">
              <h2 className="text-sm font-medium mb-2">Notificações</h2>
              <p className="text-sm text-sidebar-foreground/80">Configure alertas e preferências de notificação.</p>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default SettingsPage
