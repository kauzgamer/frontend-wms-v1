import { z } from "zod";

// Schema para criação de categoria de produto
export const createProductCategorySchema = z.object({
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  ativo: z.boolean().optional().default(true),
});

// Schema para atualização de categoria de produto
export const updateProductCategorySchema = z.object({
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição deve ter no máximo 200 caracteres")
    .optional(),
  ativo: z.boolean().optional(),
});

// Schema para query de listagem
export const listProductCategoriesQuerySchema = z.object({
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
export type CreateProductCategoryInput = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryInput = z.infer<
  typeof updateProductCategorySchema
>;
export type ListProductCategoriesQuery = z.infer<
  typeof listProductCategoriesQuerySchema
>;
