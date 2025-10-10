import { z } from "zod";

// Schema para validação de coordenada
export const coordinateSchema = z
  .object({
    min: z.number().int().min(1, "Valor mínimo deve ser pelo menos 1"),
    max: z.number().int().min(1, "Valor máximo deve ser pelo menos 1"),
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(50, "Nome deve ter no máximo 50 caracteres"),
    abrev: z
      .string()
      .min(1, "Abreviação é obrigatória")
      .max(5, "Abreviação deve ter no máximo 5 caracteres"),
    ativo: z.boolean().optional().default(true),
  })
  .refine((data) => data.max >= data.min, {
    message: "Valor máximo deve ser maior ou igual ao mínimo",
    path: ["max"],
  });

// Schema para validação de capacidade
export const capacitySchema = z
  .object({
    largura: z.number().positive("Largura deve ser positiva").optional(),
    altura: z.number().positive("Altura deve ser positiva").optional(),
    profundidade: z
      .number()
      .positive("Profundidade deve ser positiva")
      .optional(),
    peso: z.number().positive("Peso deve ser positivo").optional(),
    volume: z.number().positive("Volume deve ser positivo").optional(),
  })
  .optional();

// Schema para criação de endereço
export const createAddressSchema = z.object({
  physicalStructureId: z.string().uuid("ID de estrutura física inválido"),
  coordinates: z
    .array(
      z.object({
        tipo: z.string().min(1, "Tipo é obrigatório"),
        valor: z.number().int().min(1, "Valor deve ser pelo menos 1"),
      }),
    )
    .min(1, "Pelo menos uma coordenada é obrigatória"),
  capacity: capacitySchema,
  status: z.enum(["ATIVO", "BLOQUEADO"]).optional().default("ATIVO"),
  observations: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
});

// Schema para atualização de endereço
export const updateAddressSchema = z.object({
  status: z.enum(["ATIVO", "BLOQUEADO"]).optional(),
  capacity: capacitySchema,
  observations: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
});

// Schema para query de listagem
export const listAddressesQuerySchema = z.object({
  physicalStructureId: z
    .string()
    .uuid("ID de estrutura física inválido")
    .optional(),
  status: z.enum(["ATIVO", "BLOQUEADO", "TODOS"]).optional(),
  page: z.number().int().positive("Página deve ser positiva").optional(),
  limit: z
    .number()
    .int()
    .positive("Limite deve ser positivo")
    .max(100, "Limite máximo é 100")
    .optional(),
});

// Tipos inferidos
export type CoordinateInput = z.infer<typeof coordinateSchema>;
export type CapacityInput = z.infer<typeof capacitySchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type ListAddressesQuery = z.infer<typeof listAddressesQuerySchema>;
