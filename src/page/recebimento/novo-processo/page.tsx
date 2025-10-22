import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function Stepper() {
  const steps = [
    { n: 1, label: 'Documentos', active: true },
    { n: 2, label: 'Processo' },
    { n: 3, label: 'Endereço de origem' },
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

export default function NovoProcessoRecebimentoPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novo processo de recebimento</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Próximo</Button>
        </div>
      </div>

      <Stepper />

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="p-3 flex items-center gap-2">
          <Button>+ Novo documento</Button>
          <Button variant="outline">Buscar via leitura de notas</Button>
        </div>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data de emissão</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            </TableBody>
          </Table>
        </div>
        <div className="p-4 text-center text-sm text-gray-500 border-t">Nenhum resultado para a pesquisa.</div>
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
