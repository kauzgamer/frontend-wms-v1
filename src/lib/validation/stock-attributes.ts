import { z } from "zod";

// Schema para criação de atributo de estoque
export const createStockAttributeSchema = z.object({
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(100, "Descrição deve ter no máximo 100 caracteres"),
  formato: z.enum(["TEXTO", "DATA"], "Formato deve ser TEXTO ou DATA"),
  ativo: z.boolean().optional().default(true),
});

// Schema para atualização de atributo de estoque
export const updateStockAttributeSchema = z.object({
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(100, "Descrição deve ter no máximo 100 caracteres")
    .optional(),
  formato: z
    .enum(["TEXTO", "DATA"], "Formato deve ser TEXTO ou DATA")
    .optional(),
  ativo: z.boolean().optional(),
});

// Schema para query de listagem
export const listStockAttributesQuerySchema = z.object({
  status: z.enum(["ATIVO", "INATIVO", "TODOS"]).optional(),
  search: z
    .string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .optional(),
  page: z.number().int().positive("Página deve ser positiva").optional(),
  limit: z
    .number()
    .int()
    .positive("Limite deve ser positivo")
    .max(100, "Limite máximo é 100")
    .optional(),
});

// Tipos inferidos
export type CreateStockAttributeInput = z.infer<
  typeof createStockAttributeSchema
>;
export type UpdateStockAttributeInput = z.infer<
  typeof updateStockAttributeSchema
>;
export type ListStockAttributesQuery = z.infer<
  typeof listStockAttributesQuerySchema
>;
