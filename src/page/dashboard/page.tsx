import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Printer } from "lucide-react"
import QRCode from "react-qr-code"

export function DashboardPage() {
  const userName = "Luimá Almeida"
  const qrValue = "wms://setup?org=1&env=prod"

  return (
        <div className="flex flex-1 flex-col gap-4 p-6 pt-4">
          {/* Saudação no conteúdo (não no header) */}
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Olá, {userName}</h1>
            {/* Badges movidos para o header */}
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
  )
}

export default DashboardPage
