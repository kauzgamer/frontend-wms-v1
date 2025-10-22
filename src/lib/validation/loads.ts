import { z } from "zod";

export const createLoadSchema = z.object({
  carrierId: z.string().uuid("Transportadora inválida").optional(),
  shipmentIds: z
    .array(z.string().uuid("Documento de expedição inválido"))
    .min(1, "Selecione ao menos 1 documento"),
});

export type CreateLoadInput = z.infer<typeof createLoadSchema>;
