import { useNavigate } from 'react-router-dom'

export default function NovoDocumentoRecebimentoPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novo documento de recebimento</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md text-sm">Voltar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => navigate('/docs/recebimento/new/xml')} className="p-6 rounded-lg border bg-white text-left shadow-sm hover:shadow transition">
          <div className="text-2xl font-semibold mb-2">XML</div>
          <div className="text-sm text-gray-600">Envio de arquivos</div>
        </button>
        <button onClick={() => navigate('/docs/recebimento/new/manual')} className="p-6 rounded-lg border bg-white text-left shadow-sm hover:shadow transition">
          <div className="text-2xl font-semibold mb-2">Manual</div>
          <div className="text-sm text-gray-600">Inserção das informações</div>
        </button>
      </div>
    </div>
  )
}
