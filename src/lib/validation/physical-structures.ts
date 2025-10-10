import { z } from "zod";

// Schema para patch de coordenada individual
export const coordPatchSchema = z
  .object({
    min: z
      .number()
      .int()
      .min(1, "Valor mínimo deve ser pelo menos 1")
      .optional(),
    max: z
      .number()
      .int()
      .min(1, "Valor máximo deve ser pelo menos 1")
      .optional(),
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(50, "Nome deve ter no máximo 50 caracteres")
      .optional(),
    abrev: z
      .string()
      .min(1, "Abreviação é obrigatória")
      .max(5, "Abreviação deve ter no máximo 5 caracteres")
      .optional(),
    ativo: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.max >= data.min;
      }
      return true;
    },
    {
      message: "Valor máximo deve ser maior ou igual ao mínimo",
      path: ["max"],
    },
  );

// Schema para atualização de estrutura física
export const updatePhysicalStructureSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .optional(),
  coordenadas: z.record(z.string(), coordPatchSchema).optional(),
  ativo: z.boolean().optional(),
});

// Tipos inferidos
export type CoordPatchInput = z.infer<typeof coordPatchSchema>;
export type UpdatePhysicalStructureInput = z.infer<
  typeof updatePhysicalStructureSchema
>;
