import { z } from "zod";

export const listPickingQuerySchema = z.object({
  depositId: z.string().uuid("Depósito inválido").optional(),
  productId: z.string().uuid("Produto inválido").optional(),
  addressId: z.string().uuid("Endereço inválido").optional(),
  status: z.enum(["ATIVO", "INATIVO", "TODOS"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createPickingSchema = z.object({
  productId: z.string().uuid("Produto inválido"),
  skuId: z.string().uuid("SKU inválido").optional(),
  addressId: z.string().uuid("Endereço inválido"),
  depositId: z.string().uuid("Depósito inválido"),
  reorderPoint: z.coerce.number().int().min(0).default(0),
  maxQuantity: z.coerce.number().int().positive(),
});

export const updatePickingSchema = z.object({
  reorderPoint: z.coerce.number().int().min(0).optional(),
  maxQuantity: z.coerce.number().int().positive().optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export type ListPickingQuery = z.infer<typeof listPickingQuerySchema>;
export type CreatePickingInput = z.infer<typeof createPickingSchema>;
export type UpdatePickingInput = z.infer<typeof updatePickingSchema>;
