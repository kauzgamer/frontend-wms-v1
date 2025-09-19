import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useCreateStockAttribute } from '@/lib/hooks/use-create-stock-attribute'
import { useToast } from '@/components/ui/toast-context'

export type CreateStockAttributeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStockAttributeDialog({ open, onOpenChange }: CreateStockAttributeDialogProps) {
  const create = useCreateStockAttribute()
  const { show } = useToast()
  const [descricao, setDescricao] = useState('')
  const [formato, setFormato] = useState<'TEXTO' | 'DATA' | ''>('')
  const [ativo, setAtivo] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canSave = descricao.trim().length > 0 && (formato === 'TEXTO' || formato === 'DATA')

  async function handleConfirm() {
    if (!canSave) return
    setError(null)
    try {
      await create.mutateAsync({ descricao: descricao.trim(), formato, ativo })
      onOpenChange(false)
      setDescricao('')
      setFormato('')
      setAtivo(true)
      show({ kind: 'success', message: 'Característica de estoque criada com sucesso!' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar'
      setError(msg)
      show({ kind: 'error', message: 'Erro ao criar característica de estoque.' })
    }
  }

  function handleClose() {
    if (!create.isPending) {
      onOpenChange(false)
      setError(null)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-md bg-white shadow-lg outline-none">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b">
            <Dialog.Title className="text-xl font-semibold">Nova característica</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Fechar"
                className="text-foreground/70 hover:text-foreground"
                onClick={handleClose}
              >
                ✕
              </button>
            </Dialog.Close>
          </div>

          <div className="px-5 py-4 grid gap-4">
            {error && (
              <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>
            )}
            <div className="grid gap-1">
              <label className="text-sm font-medium">Descrição</label>
              <input
                className="h-9 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
                placeholder="Informe a descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Formato</label>
              <select
                className="h-9 rounded-md border px-3 text-sm bg-background"
                value={formato}
                onChange={(e) => setFormato(e.target.value as 'TEXTO' | 'DATA' | '')}
              >
                <option value="">Selecione o formato</option>
                <option value="TEXTO">TEXTO</option>
                <option value="DATA">DATA</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="ativo" type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
              <label htmlFor="ativo" className="text-sm">Ativo</label>
            </div>
            <div className="text-xs text-muted-foreground">Origem será marcada como “INCLUSÃO MANUAL”.</div>
          </div>

          <div className="px-5 py-4 border-t flex items-center justify-end gap-3">
            <button
              className="h-9 rounded border px-4 text-sm hover:bg-muted"
              onClick={handleClose}
              disabled={create.isPending}
            >
              Cancelar
            </button>
            <button
              className="h-9 rounded px-4 text-sm text-white disabled:opacity-60"
              style={{ backgroundColor: '#0c9abe' }}
              onClick={handleConfirm}
              disabled={!canSave || create.isPending}
            >
              {create.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
