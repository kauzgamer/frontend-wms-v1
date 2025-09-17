import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HomeIcon, Plus, Filter, Search, FileSpreadsheet } from 'lucide-react'

interface FluxoItem {
  id: string
  descricao: string
  tipo: string
  situacao: 'ATIVO' | 'INATIVO'
  padrao?: boolean
}

const MOCK_DATA: FluxoItem[] = [
  { id: '1', descricao: 'DEVOLUÇÃO', tipo: 'DEVOLUÇÃO', situacao: 'ATIVO', padrao: true },
  { id: '2', descricao: 'ENTRADA PRODUÇÃO', tipo: 'ENTRADA PRODUÇÃO', situacao: 'ATIVO', padrao: true },
  { id: '3', descricao: 'EXPEDIÇÃO', tipo: 'EXPEDIÇÃO', situacao: 'ATIVO', padrao: true },
  { id: '4', descricao: 'RECEBIMENTO', tipo: 'RECEBIMENTO', situacao: 'ATIVO', padrao: true },
]

export function FluxosPage() {
  const navigate = useNavigate()
  const [itens] = useState(MOCK_DATA)
  const [openId, setOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close on outside click
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (openId && !menuRef.current.contains(e.target as Node)) {
        setOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [openId])

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
              <BreadcrumbLink asChild>
                <Link to="/settings">Configurador</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Fluxo de processos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Fluxo de processos</h1>

      <Card className="p-0 overflow-hidden border">
        <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/30">
          <Button size="sm" className="bg-[#0c9abe] hover:bg-[#0a869d] text-white" onClick={() => {}}>
            <Plus className="size-4" /> Novo fluxo de processo
          </Button>
          <div className="text-xs flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium bg-background">
              Situação: <span className="text-[#0c9abe]">Ativo</span>
              <button className="text-muted-foreground hover:text-foreground">×</button>
            </span>
            <span className="text-muted-foreground hidden sm:inline">Arraste a coluna até aqui para agrupar</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="text-[#0c9abe] hover:underline text-sm inline-flex items-center gap-1"><Filter className="size-4" /> </button>
            <button className="text-[#0c9abe] hover:underline text-sm inline-flex items-center gap-1"><FileSpreadsheet className="size-4" /> XLS</button>
            <div className="relative">
              <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className="pl-7 pr-3 py-1.5 rounded-md border bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="Pesquisar"
              />
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-4 py-1.5 text-sm font-medium"
            >
              Voltar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="w-10" />
                <th className="text-left font-semibold px-4 py-2" style={{ color: '#0c9abe' }}>Descrição</th>
                <th className="text-left font-semibold px-4 py-2" style={{ color: '#0c9abe' }}>Tipo</th>
                <th className="text-left font-semibold px-4 py-2" style={{ color: '#0c9abe' }}>Situação</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {itens.map(item => {
                const isOpen = openId === item.id
                return (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/40 relative">
                  <td className="px-2 text-center align-middle">
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="px-2 py-1 rounded hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                    >
                      ...
                    </button>
                  </td>
                  <td className="px-4 py-2 font-medium text-[13px] tracking-wide">{item.descricao}{' '}
                    {item.padrao && (
                      <span className="ml-2 text-[10px] font-semibold rounded-full bg-muted px-2 py-1">PADRÃO</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-sm bg-[#3f3faf] text-white text-[11px] font-semibold px-3 py-1">{item.tipo}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-sm bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1">{item.situacao}</span>
                  </td>
                  <td className="px-2 text-center align-middle">
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="px-2 py-1 rounded hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                    >
                      ...
                    </button>
                    {isOpen && (
                      <div
                        ref={menuRef}
                        role="menu"
                        className="absolute z-20 mt-1 right-2 w-40 rounded-md border bg-background shadow-md animate-in fade-in slide-in-from-top-1"
                      >
                        <button
                          role="menuitem"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70"
                          onClick={() => { setOpenId(null); /* detalhes logic */ }}
                        >Detalhes</button>
                        <button
                          role="menuitem"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70"
                          onClick={() => { setOpenId(null); /* editar logic */ }}
                        >Editar</button>
                        <button
                          role="menuitem"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70 text-red-600"
                          onClick={() => { setOpenId(null); /* inativar logic */ }}
                        >Inativar</button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-6 text-[11px] text-muted-foreground">
          <span>1 - {itens.length} DE {itens.length} RESULTADOS</span>
          <button className="bg-muted/70 hover:bg-muted text-[13px] font-medium rounded-md px-6 py-2">Carregar mais 10 resultados</button>
          <div className="flex items-center gap-2">
            <span>EXIBIR</span>
            <select className="border rounded-md px-2 py-1 bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>RESULTADOS POR VEZ</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default FluxosPage
