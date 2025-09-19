import * as Dialog from '@radix-ui/react-dialog'

export type ConfirmationDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  open,
  title = 'Excluir',
  description = 'Deseja excluir esta característica de estoque?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md bg-white shadow-lg outline-none">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b">
            <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Fechar"
                className="text-foreground/70 hover:text-foreground"
                onClick={onCancel}
              >
                ✕
              </button>
            </Dialog.Close>
          </div>
          <div className="px-5 py-4 text-sm text-foreground/90">
            {description}
          </div>
          <div className="px-5 py-4 border-t flex items-center justify-end gap-3">
            <button
              className="h-9 rounded border px-4 text-sm hover:bg-muted"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className="h-9 rounded px-4 text-sm text-white"
              style={{ backgroundColor: '#0c9abe' }}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
