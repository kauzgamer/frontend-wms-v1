import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function NovoDocumentoRecebimentoManualPage() {
  const navigate = useNavigate()
  const [urgent, setUrgent] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inserção manual das informações</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button>Salvar</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="font-semibold text-gray-800">Informações de capa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Fornecedor</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="f1">Fornecedor A</SelectItem>
                <SelectItem value="f2">Fornecedor B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Transportadora (Opcional)</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione a transportadora" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="t1">Transportadora 1</SelectItem>
                <SelectItem value="t2">Transportadora 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Número NF</label>
            <Input placeholder="Informe o Número NF" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Série</label>
            <Input placeholder="Informe a série" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Pedido (Opcional)</label>
            <Input placeholder="Informe o pedido" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Data de emissão</label>
            <Input type="date" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Volumes (Opcional)</label>
            <Input placeholder="Insira a quantidade" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Subtipo do processo (Opcional)</label>
            <Input placeholder="Ex: devolução, reentrega, compra" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block">Urgente</label>
            <div className="flex items-center gap-3 text-sm">
              <input id="urgente" type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
              <label htmlFor="urgente">Não</label>
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm text-gray-600">Instrução e/ou observação</label>
            <Textarea placeholder="Informe uma instrução e/ou observação" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Itens</h2>
        <Button variant="outline" size="sm">Adicionar item</Button>
        <div className="text-sm text-gray-500">Nenhum dado encontrado</div>
      </div>
    </div>
  )
}
