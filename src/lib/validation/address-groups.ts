import { z } from "zod";

export const createAddressGroupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome do grupo é obrigatório")
      .max(100, "Máximo 100 caracteres"),
    depositId: z.string().uuid("Depósito inválido"),
    physicalStructureSlug: z
      .string()
      .min(1, "Estrutura física inválida")
      .max(100, "Máximo 100 caracteres"),
    streetPrefix: z
      .string()
      .min(1, "Prefixo é obrigatório")
      .max(20, "Máximo 20 caracteres"),
    streetFrom: z
      .string()
      .min(1, "Rua (De) é obrigatória")
      .max(10, "Máximo 10 caracteres"),
    streetTo: z
      .string()
      .min(1, "Rua (Até) é obrigatória")
      .max(10, "Máximo 10 caracteres"),
    columnFrom: z.number().int("COLUNA (De) deve ser inteiro").min(1, "Mínimo 1"),
    columnTo: z.number().int("COLUNA (Até) deve ser inteiro").min(1, "Mínimo 1"),
    levelFrom: z.number().int("NÍVEL (De) deve ser inteiro").min(0, "Mínimo 0"),
    levelTo: z.number().int("NÍVEL (Até) deve ser inteiro").min(0, "Mínimo 0"),
    palletFrom: z.number().int("PALETE (De) deve ser inteiro").min(1, "Mínimo 1"),
    palletTo: z.number().int("PALETE (Até) deve ser inteiro").min(1, "Mínimo 1"),
    funcao: z.string().min(1).default("Armazenagem"),
    acessivelAMao: z.boolean().default(false),
  })
  .refine((d) => d.columnTo >= d.columnFrom, {
    message: "COLUNA Até deve ser >= De",
    path: ["columnTo"],
  })
  .refine((d) => d.levelTo >= d.levelFrom, {
    message: "NÍVEL Até deve ser >= De",
    path: ["levelTo"],
  })
  .refine((d) => d.palletTo >= d.palletFrom, {
    message: "PALETE Até deve ser >= De",
    path: ["palletTo"],
  });

export const updateAddressGroupSchema = createAddressGroupSchema.partial();

export const listAddressGroupsQuerySchema = z.object({
  depositId: z.string().uuid("Depósito inválido").optional(),
  q: z.string().max(100).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export type CreateAddressGroupInput = z.infer<typeof createAddressGroupSchema>;
export type UpdateAddressGroupInput = z.infer<typeof updateAddressGroupSchema>;
export type ListAddressGroupsQuery = z.infer<typeof listAddressGroupsQuerySchema>;

export const previewAddressGroupRequestSchema = z.object({
  limit: z.number().int().positive().max(1000).optional().default(50),
});
export type PreviewAddressGroupRequest = z.infer<
  typeof previewAddressGroupRequestSchema
>;
