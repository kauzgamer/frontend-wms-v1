import { z } from 'zod';

// ⚠️ MÓDULO SOMENTE LEITURA - Apenas schema de consulta

// Schema para query de listagem
export const listStocksQuerySchema = z.object({
  productId: z.string().uuid('ID do produto inválido').optional(),
  skuId: z.string().uuid('ID do SKU inválido').optional(),
  addressId: z.string().uuid('ID do endereço inválido').optional(),
  estabelecimento: z.string().optional(),
  deposito: z.string().optional(),
  lote: z.string().max(50).optional(),
  status: z
    .enum(['DISPONIVEL', 'RESERVADO', 'BLOQUEADO', 'QUARENTENA', 'TODOS'])
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

// Tipo inferido
export type ListStocksQuery = z.infer<typeof listStocksQuerySchema>;
