import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Printer } from "lucide-react"
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
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{orgName}</span>
              <h1 className="text-2xl font-semibold leading-tight">Olá, {userName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Integração Nativa</Badge>
              <Badge variant="success">Online</Badge>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
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
