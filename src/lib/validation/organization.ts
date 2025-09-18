import { z } from 'zod'

export const organizationSchema = z.object({
  codigo: z.string().min(1).max(20),
  nome: z.string().min(1).max(100),
  cnpj: z.string().length(14).optional(),
  ativo: z.boolean().optional(),
  timezone: z.string().min(1).optional(),
})

export type OrganizationForm = z.infer<typeof organizationSchema>
