import { z } from "zod";

// Schema básico para endereço no escopo
const addressInScopeSchema = z.object({
  id: z.string(),
  depositoId: z.string(),
  estruturaFisicaId: z.string(),
  coordenadas: z.array(
    z.object({
      tipo: z.string(),
      nome: z.string(),
      abrev: z.string(),
      inicio: z.union([z.string(), z.number()]),
      fim: z.union([z.string(), z.number()]),
    })
  ),
  situacao: z.string().optional(),
  enderecoEspecifico: z
    .object({
      id: z.string(),
      enderecoCompleto: z.string(),
      enderecoAbreviado: z.string(),
      funcao: z.string(),
      acessivelAMao: z.boolean(),
      situacao: z.string(),
    })
    .optional(),
});

// Alinhado com o backend createInventorySchema
export const createInventorySchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(1, "Identificador é obrigatório")
    .max(20, "Identificador deve ter no máximo 20 caracteres")
    .optional(),
  descricao: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  tipo: z
    .enum(
      ["GERAL", "ENDERECO", "PRODUTO"] as const,
      "Tipo de inventário inválido"
    )
    .optional()
    .default("GERAL"),
  escopo: z.array(addressInScopeSchema).optional(),
  considerStockAsFirstCount: z.boolean().optional().default(false),
  plannerCanChooseValidCount: z.boolean().optional().default(false),
  operatorPolicy: z
    .enum(["LIVRE", "NAO_SEQUENCIAL", "RESTRITO"] as const)
    .optional()
    .default("LIVRE"),
});

export type CreateInventoryForm = z.infer<typeof createInventorySchema>;
