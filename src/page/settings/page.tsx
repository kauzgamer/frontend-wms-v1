import { Card } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { HomeIcon, Workflow, Warehouse, MapPinned, Component as StructureIcon, ListChecks, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
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
              <BreadcrumbPage>Configurador</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

  <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Configurador WMS</h1>

      {/* Feature cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-6">
        <Card className="p-6 flex flex-col items-center gap-4 text-center cursor-pointer hover:shadow-sm transition">
          <Workflow className="size-10" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#0c9abe' }}>Fluxo de processos</span>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-4 text-center cursor-pointer hover:shadow-sm transition">
          <Warehouse className="size-10" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#0c9abe' }}>Depósito</span>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-4 text-center cursor-pointer hover:shadow-sm transition">
          <MapPinned className="size-10" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#0c9abe' }}>Endereços</span>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-4 text-center cursor-pointer hover:shadow-sm transition">
          <StructureIcon className="size-10" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#0c9abe' }}>Estrutura física</span>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-4 text-center cursor-pointer hover:shadow-sm transition">
          <ListChecks className="size-10" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#0c9abe' }}>Grupo de atividade</span>
        </Card>
        <Card className="p-6 flex flex-col items-center gap-4 text-center cursor-pointer hover:shadow-sm transition">
          <Users className="size-10" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#0c9abe' }}>Usuários</span>
        </Card>
      </div>

      {/* Cadastros list */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold">Cadastros (11)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Selecione a rotina de Cadastros na lista abaixo:</p>
        </div>
        <div className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-2 text-sm py-4 px-4">
            <div className="space-y-2">
              <button className="text-left w-full hover:underline">Produto/SKU</button>
              <button className="text-left w-full hover:underline">Características de estoque</button>
              <button className="text-left w-full hover:underline">Categoria de produto</button>
              <button className="text-left w-full hover:underline">Atributos de estoque</button>
            </div>
            <div className="space-y-2">
              <button className="text-left w-full hover:underline">Fornecedor</button>
              <button className="text-left w-full hover:underline">Transportadora</button>
              <button className="text-left w-full hover:underline">Cliente</button>
              <button className="text-left w-full hover:underline">Kit de produtos</button>
            </div>
            <div className="space-y-2">
              <button className="text-left w-full hover:underline">Grupo de Endereço</button>
              <button className="text-left w-full hover:underline">Mapeamento de endereço</button>
              <button className="text-left w-full hover:underline">Tipo de estoque</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
