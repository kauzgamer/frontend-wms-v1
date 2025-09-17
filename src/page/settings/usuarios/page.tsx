import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { Search, HomeIcon } from 'lucide-react'

interface UsuarioItem {
  id: string
  nome: string
  login: string
  email: string
  status: 'ATIVO' | 'INATIVO'
}

const MOCK_USERS: UsuarioItem[] = [
  { id: '1', nome: 'Andre Becker', login: 'andre.becker', email: 'andre.becker@example.com', status: 'ATIVO' },
  { id: '2', nome: 'Angelo Ricardo', login: 'angelo.ricardo', email: 'angelo.ricardo@example.com', status: 'ATIVO' },
  { id: '3', nome: 'cs.supply@totvs.com', login: 'admin', email: 'cs.supply@totvs.com', status: 'ATIVO' },
  { id: '4', nome: 'Gabriel Santos', login: 'gabriel.santos', email: 'gabriel.santos@example.com', status: 'ATIVO' },
]

export function UsuariosPage() {
  const navigate = useNavigate()
  const [users] = useState(MOCK_USERS)
  const [query, setQuery] = useState('')

  const filtered = users.filter(u => {
    const q = query.toLowerCase()
    return (
      u.nome.toLowerCase().includes(q) ||
      u.login.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

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
              <BreadcrumbPage>Usuários</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Usuários</h1>

      <div className="flex items-center gap-4 max-w-sm">
        <div className="relative w-full">
          <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-7 pr-3 h-10 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground shadow-sm"
              placeholder="Pesquisar"
            />
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-6 h-10 text-sm font-medium"
        >
          Voltar
        </button>
      </div>

      <div className="grid gap-4 max-w-sm">
        {filtered.map(u => (
          <Card key={u.id} className="border shadow-sm p-0 overflow-hidden">
            <div className="flex flex-col">
              <div className="flex items-start justify-between px-5 pt-4">
                <div className="text-[15px] font-medium" style={{color:'#4a5c60'}}>{u.nome}</div>
                <span className="ml-2 inline-flex items-center rounded-full bg-[#009c80] text-white text-[10px] font-semibold px-3 py-[4px] leading-none shadow-sm">{u.status}</span>
              </div>
              <div className="mt-3 px-5 pb-4 border-t pt-3 space-y-2">
                <div className="flex items-center gap-2 text-[12px]" style={{color:'#4a5c60'}}>
                  <span className="inline-flex items-center justify-center w-4">👤</span>
                  <span>{u.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]" style={{color:'#4a5c60'}}>
                  <span className="inline-flex items-center justify-center w-4">✉️</span>
                  <span>{u.login}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] overflow-hidden" style={{color:'#4a5c60'}}>
                  <span className="inline-flex items-center justify-center w-4">📧</span>
                  <span className="break-all leading-snug max-h-10 overflow-auto custom-scroll thin-scrollbar">{u.email}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default UsuariosPage
