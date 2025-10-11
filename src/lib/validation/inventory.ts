import { z } from 'zod'

// Alinhado com o backend createInventorySchema
export const createInventorySchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(1, 'Identificador é obrigatório')
    .max(20, 'Identificador deve ter no máximo 20 caracteres')
    .optional(),
  descricao: z
    .string()
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  tipo: z
    .enum(['GERAL', 'ENDERECO', 'PRODUTO'] as const, 'Tipo de inventário inválido')
    .optional()
    .default('GERAL'),
  escopo: z.object({}).catchall(z.any()).optional(),
})

export type CreateInventoryForm = z.infer<typeof createInventorySchema>
