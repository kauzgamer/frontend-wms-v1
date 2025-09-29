// removed useState; using server data
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Check } from 'lucide-react'

type Structure = { 
  id: string
  titulo: string
  descricao: string
  origem: 'PADRÃO' | 'ALTERADO'
  ativo: boolean
}

const initialStructures: Structure[] = [
  // Fallback structures in case API fails
  {
    id: 'porta-palete',
    titulo: 'Porta palete',
    descricao: 'Bloco; Rua (R); Coluna (C); Andar (N); Apartamento (P)',
    origem: 'ALTERADO',
    ativo: true,
  },
  {
    id: 'blocado-armazenagem',
    titulo: 'Blocado armazenagem',
    descricao: 'Setor (SE); Quadra (Q); Rua (R)',
    origem: 'PADRÃO',
    ativo: true,
  },
  {
    id: 'patio',
    titulo: 'Pátio',
    descricao: 'Quadra (Q); Rua (R)',
    origem: 'PADRÃO',
    ativo: false,
  },
  {
    id: 'gaveteiro',
    titulo: 'Gaveteiro',
    descricao: 'Armário (AR); Corredor (CO); Gaveta (G)',
    origem: 'PADRÃO',
    ativo: false,
  },
  {
    id: 'flowrack',
    titulo: 'Flowrack',
    descricao: 'Bloco (B); Rua (R); Coluna (C); Andar (A)',
    origem: 'PADRÃO',
    ativo: false,
  },
  {
    id: 'estanteria',
    titulo: 'Estantéria',
    descricao: 'Estante (E); Corredor (CO); Posição (P)',
    origem: 'PADRÃO',
    ativo: false,
  },
  {
    id: 'drive-through',
    titulo: 'Drive through',
    descricao: 'Bloco (B); Rua (R); Coluna (C)',
    origem: 'PADRÃO',
    ativo: false,
  },
  {
    id: 'drive-in',
    titulo: 'Drive in',
    descricao: 'Bloco (B); Rua (R); Coluna (C)',
    origem: 'PADRÃO',
    ativo: false,
  },
  {
    id: 'cantilever',
    titulo: 'Cantilever',
    descricao: 'Bloco (B); Rua (R); Coluna (C); Andar (A)',
    origem: 'PADRÃO',
    ativo: false,
  },
]

function Switch({ checked, onChange, id, label }: { checked: boolean; onChange: (v: boolean) => void; id: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9abe] ${checked ? 'bg-[#2f8ac9]' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        >
          {checked ? <Check className="size-3.5 text-[#2f8ac9]" /> : null}
        </span>
      </button>
      <span className="text-sm text-muted-foreground">{checked ? 'Ativo' : 'Inativo'}</span>
    </div>
  )
}

import { usePhysicalStructures, useUpdateAnyPhysicalStructure } from '@/lib/hooks/use-physical-structures'

export default function EstruturaFisicaPage() {
  const { data } = usePhysicalStructures()
  const navigate = useNavigate()

  const items: Structure[] = useMemo(() => {
    if (data && Array.isArray(data)) {
      return data.map((d) => ({
        id: d.id,
        titulo: d.titulo,
        descricao: d.descricao,
        origem: d.origem,
        ativo: d.situacao === 'ATIVO',
      }))
    }
    return initialStructures
  }, [data])

  const updater = useUpdateAnyPhysicalStructure()
  function toggleActive(id: string, current: boolean) {
    updater.mutate({ slug: id, input: { ativo: !current } })
  }

  return (
    <div className="flex flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Início</Link>
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
              <BreadcrumbPage>Estrutura física</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Estrutura física</h1>
          <Button asChild variant="outline">
            <Link to="/settings" aria-label="Voltar para Configurador">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-[#0c9abe]">{s.titulo}</span>
                </CardTitle>
              </div>
              <button
                aria-label={`Editar ${s.titulo}`}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                onClick={() => navigate(`/settings/estrutura-fisica/${s.id}/edit`)}
                title="Editar"
              >
                <Pencil className="size-4" />
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.descricao}</p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-3">
                <Switch id={`switch-${s.id}`} label={`Alternar situação de ${s.titulo}`} checked={s.ativo} onChange={() => toggleActive(s.id, s.ativo)} />
              </div>
              <div className="ml-auto">
                <Badge className={`${s.origem === 'PADRÃO' ? 'bg-gray-600 text-white' : 'bg-amber-500 text-white'}`}>{s.origem}</Badge>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
