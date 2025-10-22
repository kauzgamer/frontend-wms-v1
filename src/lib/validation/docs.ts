import { z } from 'zod'

export const createExpedicaoManualSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  transportadoraId: z.string().optional(),
  numeroNf: z.string().min(1, 'Número NF é obrigatório'),
  serie: z.string().min(1, 'Série é obrigatória'),
  pedido: z.string().optional(),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataEntrega: z.string().optional(),
  volumes: z.string().optional(),
  viagem: z.string().optional(),
  subtipoProcesso: z.string().optional(),
  urgente: z.boolean().optional().default(false),
  observacao: z.string().optional(),
  enderecoEntrega: z.object({
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    estado: z.string().length(2, 'UF deve ter 2 caracteres').regex(/^[A-Z]{2}$/).optional(),
    cidade: z.string().optional(),
  }),
  itens: z.array(z.object({
    produtoId: z.string().min(1, 'Produto é obrigatório'),
    tipoEstoque: z.string().min(1, 'Tipo de estoque é obrigatório'),
    unidade: z.string().min(1, 'Unidade é obrigatória'),
    quantidade: z.number().positive('Quantidade deve ser positiva'),
    valorUnit: z.number().nonnegative('Valor unitário inválido').optional(),
  })).min(0),
})

export type CreateExpedicaoManualInput = z.infer<typeof createExpedicaoManualSchema>

export const createRecebimentoManualSchema = z.object({
  fornecedorId: z.string().min(1, 'Fornecedor é obrigatório'),
  transportadoraId: z.string().optional(),
  numeroNf: z.string().min(1, 'Número NF é obrigatório'),
  serie: z.string().min(1, 'Série é obrigatória'),
  pedido: z.string().optional(),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  volumes: z.string().optional(),
  subtipoProcesso: z.string().optional(),
  urgente: z.boolean().optional().default(false),
  observacao: z.string().optional(),
  itens: z.array(z.object({
    produtoId: z.string().min(1, 'Produto é obrigatório'),
    unidade: z.string().min(1, 'Unidade é obrigatória'),
    quantidade: z.number().positive('Quantidade deve ser positiva'),
    valorUnit: z.number().nonnegative('Valor unitário inválido').optional(),
  })).min(0),
})

export type CreateRecebimentoManualInput = z.infer<typeof createRecebimentoManualSchema>
