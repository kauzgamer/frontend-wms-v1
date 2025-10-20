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
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
  <Link to="/settings/fluxos" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] rounded-md">
    <Card className="aspect-[6/5] flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-sm transition p-4">
      <Workflow className="size-9" style={{ color: '#0c9abe' }} />
      <span className="text-base font-medium" style={{ color: '#4a5c60' }}>Fluxo de processos</span>
    </Card>
  </Link>
  <Link to="/settings/deposito" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] rounded-md">
    <Card className="aspect-[6/5] flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-sm transition p-4">
      <Warehouse className="size-9" style={{ color: '#0c9abe' }} />
      <span className="text-base font-medium" style={{ color: '#4a5c60' }}>Depósito</span>
    </Card>
  </Link>
  <Link to="/settings/endereco" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] rounded-md">
    <Card className="aspect-[6/5] flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-sm transition p-4">
      <MapPinned className="size-9" style={{ color: '#0c9abe' }} />
      <span className="text-base font-medium" style={{ color: '#4a5c60' }}>Endereços</span>
    </Card>
  </Link>
  <Link to="/settings/estrutura-fisica" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] rounded-md">
    <Card className="aspect-[6/5] flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-sm transition p-4">
      <StructureIcon className="size-9" style={{ color: '#0c9abe' }} />
      <span className="text-base font-medium" style={{ color: '#4a5c60' }}>Estrutura física</span>
    </Card>
  </Link>
  <Card className="aspect-[6/5] flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-sm transition p-4">
    <ListChecks className="size-9" style={{ color: '#0c9abe' }} />
          <span className="text-base font-medium" style={{ color: '#4a5c60' }}>Grupo de atividade</span>
        </Card>
  <Link to="/settings/usuarios" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] rounded-md">
    <Card className="aspect-[6/5] flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:shadow-sm transition p-4">
      <Users className="size-9" style={{ color: '#0c9abe' }} />
      <span className="text-base font-medium" style={{ color: '#4a5c60' }}>Usuários</span>
    </Card>
  </Link>
      </div>

      {/* Cadastros list */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold" style={{ color: '#4a5c60' }}>Cadastros (11)</h2>
          <p className="text-xs mt-0.5" style={{ color: '#4a5c60' }}>Selecione a rotina de Cadastros na lista abaixo:</p>
        </div>
        <div className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-2 text-sm py-4 px-4">
            <div className="space-y-0 text-[15px] leading-snug">
              <Link to="/settings/products" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Produto/SKU</Link>
              <Link to="/settings/caracteristicas-estoque" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Características de estoque</Link>
              <Link to="/settings/categoria-produto" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Categoria de produto</Link>
              <button className="text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Atributos de estoque</button>
            </div>
            <div className="space-y-0 text-[15px] leading-snug">
              <Link to="/settings/fornecedor" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Fornecedor</Link>
              <Link to="/settings/transportadora" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Transportadora</Link>
              <Link to="/settings/cliente" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Cliente</Link>
              <button className="text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Kit de produtos</button>
            </div>
            <div className="space-y-0 text-[15px] leading-snug">
              <Link to="/settings/grupo-endereco" className="block text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Grupo de Endereço</Link>
              <button className="text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Mapeamento de endereço</button>
              <button className="text-left w-full hover:underline border-b border-border/60 py-3" style={{ color: '#0c9abe' }}>Tipo de estoque</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
