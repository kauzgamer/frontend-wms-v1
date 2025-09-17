import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { Search, HomeIcon, Plus, Mail, User as UserIcon, MoreVertical } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/lib/use-auth'

interface ApiUser {
  id: string
  email: string
  name: string
  provider: string
  providerId: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

interface UsuarioItem {
  id: string
  nome: string
  login: string
  email: string
  status: 'ATIVO' | 'INATIVO'
  lastLoginAt?: string
}

export function UsuariosPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [query, setQuery] = useState('')

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<ApiUser[]>('/users'),
    enabled: !!token,
  })

  const users: UsuarioItem[] = useMemo(() => {
    if (!data) return []
    return data.map(u => ({
      id: u.id,
      nome: u.name || u.email,
      login: u.providerId,
      email: u.email,
      status: 'ATIVO',
      lastLoginAt: u.lastLoginAt,
    }))
  }, [data])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return users.filter(u =>
      u.nome.toLowerCase().includes(q) ||
      u.login.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  }, [users, query])

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

      <div className="flex items-center gap-4 max-w-xl">
        <div className="relative w-80 max-w-full">
          <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-7 pr-3 h-10 rounded-md border bg-white text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe] placeholder:text-muted-foreground shadow-sm"
              placeholder="Pesquisar"
            />
        </div>
        <button
          type="button"
          className="bg-[#0082a1] hover:bg-[#006c85] text-white rounded-md h-10 px-5 text-sm font-semibold inline-flex items-center gap-2 shadow-sm"
          onClick={() => { /* open create user modal */ }}
        >
          <Plus className="size-4" /> Novo Usuário
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#0c9abe] hover:bg-[#0a869d] text-white rounded-md px-6 h-10 text-sm font-medium"
        >
          Voltar
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isLoading && <span className="text-sm text-muted-foreground">Carregando usuários...</span>}
        {isFetching && !isLoading && <span className="text-xs text-muted-foreground">Atualizando...</span>}
        {isError && (
          <button onClick={() => refetch()} className="text-sm text-red-600 underline">
            Erro ao carregar. Tentar novamente
          </button>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <span className="text-sm text-muted-foreground">Nenhum usuário encontrado</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-none">
        {filtered.map(u => (
          <UserCard key={u.id} user={u} />
        ))}
      </div>
    </div>
  )
}

export default UsuariosPage

// -------------------- User Card Component --------------------
interface UserCardProps { user: UsuarioItem }

function UserCard({ user }: UserCardProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="group relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          type="button"
          aria-haspopup="menu"
            aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="p-1.5 rounded-md text-[#0c9abe] hover:bg-[#e3f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe]"
        >
          <MoreVertical className="size-4" />
        </button>
        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-1 w-40 rounded-md border bg-white shadow-md animate-in fade-in slide-in-from-top-1"
          >
            <button className="w-full text-left text-sm px-3 py-2 hover:bg-muted/70" onClick={() => setOpen(false)}>Detalhes</button>
            <button className="w-full text-left text-sm px-3 py-2 hover:bg-muted/70" onClick={() => setOpen(false)}>Editar</button>
            <button className="w-full text-left text-sm px-3 py-2 hover:bg-muted/70 text-red-600" onClick={() => setOpen(false)}>Desativar</button>
          </div>
        )}
      </div>
      <Card className="border shadow-sm p-0 overflow-hidden transition hover:shadow-md focus-within:ring-2 focus-within:ring-[#0c9abe]">
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-5 pt-4 pr-10">
            <div className="text-[15px] font-semibold tracking-wide" style={{color:'#4a5c60'}}>{user.nome}</div>
            <span className="ml-2 inline-flex items-center rounded-full bg-[#009c80] text-white text-[10px] font-semibold px-3 py-[4px] leading-none shadow-sm">{user.status}</span>
          </div>
          <div className="mt-3 px-5 pb-4 border-t pt-3 space-y-2">
            <div className="flex items-center gap-2 text-[12px]" style={{color:'#4a5c60'}}>
              <UserIcon className="size-4 text-[#0c9abe]" />
              <span className="truncate">{user.nome}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]" style={{color:'#4a5c60'}}>
              <UserIcon className="size-4 opacity-0" />
              <span className="truncate">{user.login}</span>
            </div>
            <div className="flex items-start gap-2 text-[12px]" style={{color:'#4a5c60'}}>
              <Mail className="size-4 text-[#0c9abe] mt-[2px]" />
              <span className="leading-snug max-h-10 overflow-auto custom-scroll thin-scrollbar break-all">{user.email}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
