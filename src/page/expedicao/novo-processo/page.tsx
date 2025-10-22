import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useShipments } from '@/lib/hooks/use-shipments'
import { useCreateLoad } from '@/lib/hooks/use-loads'
import { createLoadSchema } from '@/lib/validation/loads'

function Stepper() {
  const steps = [
    { n: 1, label: 'Documentos', active: true },
    { n: 2, label: 'Processo' },
    { n: 3, label: 'Endereço de destino' },
    { n: 4, label: 'Resumo' },
  ]
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mb-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-3 flex-1">
          <div className={`size-7 rounded-full border flex items-center justify-center text-sm ${s.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}>{s.n}</div>
          <div className="text-sm text-gray-700 whitespace-nowrap">{s.label}</div>
          {i < steps.length - 1 && <div className="h-px bg-gray-300 flex-1" />}
        </div>
      ))}
    </div>
  )
}

export default function NovoProcessoExpedicaoPage() {
  const navigate = useNavigate()
  const { data: shipments, isLoading } = useShipments({ status: 'ABERTO', limit: 50 })
  const { mutateAsync: createLoad, isPending } = useCreateLoad()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const all = shipments ?? []
    if (!search.trim()) return all
    const s = search.toLowerCase()
    return all.filter(doc =>
      (doc.numeroNf?.toLowerCase() ?? '').includes(s) ||
      (doc.pedido?.toLowerCase() ?? '').includes(s)
    )
  }, [shipments, search])

  async function handleNext() {
    const shipmentIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
    const parsed = createLoadSchema.safeParse({ shipmentIds })
    if (!parsed.success) {
      alert(parsed.error.issues.map(i => i.message).join('\n'))
      return
    }
    try {
      const load = await createLoad({ shipmentIds })
      navigate(`/cargas/${load.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar carga'
      alert(msg)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novo processo de expedição</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={handleNext} disabled={isPending}>Próximo</Button>
        </div>
      </div>

      <Stepper />

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="p-3 flex items-center gap-2">
          <Button disabled>+ Novo documento</Button>
          <Button variant="outline" disabled>Buscar via leitura de notas</Button>
          <div className="ml-auto flex items-center gap-2">
            <Input placeholder="Pesquisar" className="h-8 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="ghost" className="h-8">Pesquisa Avançada</Button>
          </div>
        </div>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Urgência</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Viagem</TableHead>
                <TableHead>Data de emissão</TableHead>
                <TableHead>Data de entrega</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9}>Carregando...</TableCell></TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={!!selected[doc.id]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [doc.id]: e.target.checked }))}
                      />
                    </TableCell>
                    <TableCell>{doc.urgente ? 'URGENTE' : '-'}</TableCell>
                    <TableCell>{doc.numeroNf}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{new Date(doc.dataEmissao).toLocaleDateString()}</TableCell>
                    <TableCell>{doc.dataEntrega ? new Date(doc.dataEntrega).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{doc.observacao ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {(!isLoading && filtered.length === 0) && (
          <div className="p-4 text-center text-sm text-gray-500 border-t">Nenhum resultado para a pesquisa.</div>
        )}
        <div className="flex items-center justify-between p-3 border-t text-sm text-gray-600">
          <Button variant="secondary" className="bg-gray-200" disabled>Carregar mais 10 resultados</Button>
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
