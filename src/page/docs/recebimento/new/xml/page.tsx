import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UploadXmlRecebimentoPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const navigate = useNavigate()

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files)
  }

  function onUpload() {
    // Futuro: enviar via API e navegar para a lista
    navigate('/docs')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Enviar arquivo Xml</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md text-sm">Voltar</button>
      </div>

      <div className="rounded-lg border border-dashed p-10 bg-white">
        <div className="text-center">
          <p className="text-gray-700 text-lg mb-2">Arraste os arquivos aqui</p>
          <p className="text-sm text-blue-600">ou selecione os arquivos no computador</p>
          <div className="mt-6">
            <input type="file" accept=".xml" multiple onChange={onChange} />
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <div>Formatos adotados: XML</div>
        <div>Limite de tamanho por arquivo: até 500 KB</div>
      </div>

      <div>
        <button disabled={!files?.length} onClick={onUpload} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">Enviar</button>
      </div>
    </div>
  )
}
