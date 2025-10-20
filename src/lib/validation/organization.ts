import { z } from "zod";

// Schema para upsert de organização (alinhado com backend)
export const upsertOrganizationSchema = z.object({
  codigo: z
    .string()
    .min(1, "Código é obrigatório")
    .max(20, "Código deve ter no máximo 20 caracteres"),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  cnpj: z
    .string()
    .length(14, "CNPJ deve ter 14 dígitos")
    .regex(/^\d+$/, "CNPJ deve conter apenas números")
    .optional(),
  ativo: z.boolean().optional().default(true),
  timezone: z.string().optional(),
  createPrincipalDeposit: z.boolean().optional(),
});

// Schema legado (manter compatibilidade)
export const organizationSchema = z.object({
  codigo: z.string().min(1).max(20),
  nome: z.string().min(1).max(100),
  cnpj: z.string().length(14).optional(),
  ativo: z.boolean().optional(),
  timezone: z.string().min(1).optional(),
});

export type OrganizationForm = z.infer<typeof organizationSchema>;
export type UpsertOrganizationInput = z.infer<typeof upsertOrganizationSchema>;
