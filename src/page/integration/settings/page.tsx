import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { ChevronLeft, HomeIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

interface ConfigItem {
  id: string
  title: string
  subtitle?: string
  path?: string // future nested path
}

const configItems: ConfigItem[] = [
  { id: 'org', title: 'Organização' },
  { id: 'unified-product', title: 'Produto unificado' },
  { id: 'stock-type', title: 'Tipo de Estoque' },
  { id: 'erp', title: 'Integração ERP' },
  { id: 'stock-attributes', title: 'Características de estoque' },
  { id: 'activations', title: 'Ativações' },
  { id: 'monitoring', title: 'Monitoramento ativo' },
]

export function IntegrationSettingsPage() {
  const navigate = useNavigate()

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Breadcrumb>
                <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">
                        <HomeIcon size={16} aria-hidden="true" />
                        <span className="sr-only">Home</span>
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/integration">Integração</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Configurações de integração</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="mt-4 text-2xl font-semibold leading-tight">Configurações de integração</h1>
            </div>
            <Button onClick={() => navigate('/integration')} className="shrink-0">
              <ChevronLeft className="size-4" /> Voltar
            </Button>
          </div>

          <div className="border rounded-lg bg-card">
            <div className="p-4 border-b">
              <h2 className="text-base font-semibold">Integrações</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Selecione a configuração</p>
            </div>
            <ul>
              {configItems.map(item => (
                <li key={item.id} className="px-6 py-3 border-b last:border-b-0 hover:bg-muted/40 cursor-pointer text-sm">
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default IntegrationSettingsPage
