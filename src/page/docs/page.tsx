import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'

function Toolbar({ type }: { type: 'expedicao' | 'recebimento' }) {
  const navigate = useNavigate()
  const now = useMemo(() => new Date().toLocaleString(), [])
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>Atualizado em: {now}</div>
        <div className="flex items-center gap-2">
          <Input placeholder="Pesquisar" className="h-8 w-64" />
          <Button variant="outline" size="sm">Pesquisa Avançada</Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => navigate(type === 'expedicao' ? '/docs/expedicao/new' : '/docs/recebimento/new')}>
          + Novo documento
        </Button>
        <Button variant="outline" onClick={() => {/* futuro: iniciar processo */}}>
          + Novo processo de {type === 'expedicao' ? 'expedição' : 'recebimento'}
        </Button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center text-sm text-gray-500 py-20">Nenhum resultado para a pesquisa com filtros informados.</div>
  )
}

function ExpedicaoList() {
  return (
    <div className="space-y-4">
      <Toolbar type="expedicao" />
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Urgência</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Viagem</TableHead>
                <TableHead>Data de emissão</TableHead>
                <TableHead>Data de entrega</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* vazio por enquanto */}
            </TableBody>
          </Table>
        </div>
        <EmptyState />
        <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
          <div>0 RESULTADOS</div>
          <div className="flex items-center gap-2">
            <span>Exibir</span>
            <select className="h-8 border rounded-md px-2">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>RESULTADOS POR VEZ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecebimentoList() {
  return (
    <div className="space-y-4">
      <Toolbar type="recebimento" />
      <div className="overflow-hidden rounded-md border bg-white">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Data de emissão</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            </TableBody>
          </Table>
        </div>
        <EmptyState />
      </div>
    </div>
  )
}

export default function DocsPage() {
  const [tab, setTab] = useState<'recebimento' | 'expedicao'>('expedicao')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documentos</h1>
      </div>
  <Tabs value={tab} onValueChange={(v: string) => setTab(v as 'recebimento' | 'expedicao')}>
        <TabsList>
          <TabsTrigger value="recebimento">Documento de recebimento</TabsTrigger>
          <TabsTrigger value="expedicao">Documento de expedição</TabsTrigger>
        </TabsList>
        <div className="mt-4"></div>
        <TabsContent value="recebimento">
          <RecebimentoList />
        </TabsContent>
        <TabsContent value="expedicao">
          <ExpedicaoList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
