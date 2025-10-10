import { z } from "zod";

// Schema para criação de transportadora
export const createCarrierSchema = z
  .object({
    cnpj: z
      .string()
      .length(14, "CNPJ deve ter 14 dígitos")
      .regex(/^\d+$/, "CNPJ deve conter apenas números")
      .optional(),
    cpf: z
      .string()
      .length(11, "CPF deve ter 11 dígitos")
      .regex(/^\d+$/, "CPF deve conter apenas números")
      .optional(),
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(200, "Nome deve ter no máximo 200 caracteres"),
    uf: z
      .string()
      .length(2, "UF deve ter 2 caracteres")
      .regex(/^[A-Z]{2}$/, "UF deve conter apenas letras maiúsculas")
      .optional(),
    stateRegistration: z
      .string()
      .max(20, "Inscrição estadual deve ter no máximo 20 caracteres")
      .optional(),
    active: z.boolean().optional().default(true),
  })
  .refine((data) => data.cnpj || data.cpf, {
    message: "CNPJ ou CPF é obrigatório",
    path: ["cnpj"],
  });

// Schema para atualização de transportadora
export const updateCarrierSchema = z.object({
  cnpj: z
    .string()
    .length(14, "CNPJ deve ter 14 dígitos")
    .regex(/^\d+$/, "CNPJ deve conter apenas números")
    .optional(),
  cpf: z
    .string()
    .length(11, "CPF deve ter 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números")
    .optional(),
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .optional(),
  uf: z
    .string()
    .length(2, "UF deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "UF deve conter apenas letras maiúsculas")
    .optional(),
  stateRegistration: z
    .string()
    .max(20, "Inscrição estadual deve ter no máximo 20 caracteres")
    .optional(),
  active: z.boolean().optional(),
});

// Schema para query de listagem
export const listCarriersQuerySchema = z.object({
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
export type CreateCarrierInput = z.infer<typeof createCarrierSchema>;
export type UpdateCarrierInput = z.infer<typeof updateCarrierSchema>;
export type ListCarriersQuery = z.infer<typeof listCarriersQuerySchema>;
