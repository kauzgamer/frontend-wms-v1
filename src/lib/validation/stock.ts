import { z } from 'zod';

// Schema para criação de estoque
export const createStockSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  skuId: z.string().uuid('ID do SKU inválido').optional().nullable(),
  addressId: z.string().uuid('ID do endereço inválido'),
  lote: z
    .string()
    .max(50, 'Lote deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
  quantity: z.number().nonnegative('Quantidade deve ser positiva ou zero'),
  quantityReserved: z
    .number()
    .nonnegative('Quantidade reservada deve ser positiva ou zero')
    .optional(),
  unitOfMeasure: z
    .string()
    .max(20, 'Unidade de medida deve ter no máximo 20 caracteres')
    .optional()
    .nullable(),
  validade: z
    .string()
    .datetime('Data de validade inválida')
    .optional()
    .nullable(),
  fabricacao: z
    .string()
    .datetime('Data de fabricação inválida')
    .optional()
    .nullable(),
  documentoOrigem: z
    .string()
    .max(100, 'Documento de origem deve ter no máximo 100 caracteres')
    .optional()
    .nullable(),
  status: z
    .enum(['DISPONIVEL', 'RESERVADO', 'BLOQUEADO', 'AVARIADO'], {
      message: 'Status deve ser DISPONIVEL, RESERVADO, BLOQUEADO ou AVARIADO',
    })
    .optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional().nullable(),
  observacao: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
});

// Schema para atualização de estoque
export const updateStockSchema = createStockSchema.partial();

// Schema para ajuste de quantidade
export const adjustQuantitySchema = z.object({
  quantity: z.number({ message: 'Quantidade deve ser um número' }),
  motivo: z
    .string()
    .min(1, 'Motivo é obrigatório')
    .max(200, 'Motivo deve ter no máximo 200 caracteres'),
  tipo: z.enum(['ADICAO', 'REDUCAO', 'AJUSTE'], {
    message: 'Tipo deve ser ADICAO, REDUCAO ou AJUSTE',
  }),
});

// Schema para movimentação de estoque
export const moveStockSchema = z.object({
  addressIdDestino: z.string().uuid('ID do endereço de destino inválido'),
  quantity: z.number().positive('Quantidade deve ser positiva').optional().nullable(),
  motivo: z
    .string()
    .min(1, 'Motivo é obrigatório')
    .max(200, 'Motivo deve ter no máximo 200 caracteres'),
});

// Schema para query de listagem
export const listStocksQuerySchema = z.object({
  productId: z.string().uuid('ID do produto inválido').optional(),
  skuId: z.string().uuid('ID do SKU inválido').optional(),
  addressId: z.string().uuid('ID do endereço inválido').optional(),
  lote: z.string().max(50).optional(),
  status: z
    .enum(['DISPONIVEL', 'RESERVADO', 'BLOQUEADO', 'AVARIADO', 'TODOS'])
    .optional(),
  search: z.string().max(100, 'Busca deve ter no máximo 100 caracteres').optional(),
  page: z.number().int().positive('Página deve ser positiva').optional(),
  limit: z
    .number()
    .int()
    .positive('Limite deve ser positivo')
    .max(100, 'Limite máximo é 100')
    .optional(),
});

// Tipos inferidos
export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type AdjustQuantityInput = z.infer<typeof adjustQuantitySchema>;
export type MoveStockInput = z.infer<typeof moveStockSchema>;
export type ListStocksQuery = z.infer<typeof listStocksQuerySchema>;
