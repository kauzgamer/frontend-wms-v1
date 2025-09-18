import { z } from 'zod'

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Informe a descrição').max(50).optional(),
  sku: z.string().min(1, 'Informe o código').max(50).optional(),
  externalCode: z.string().max(50).optional(),
  mobileDescription: z.string().max(120).optional(),
  unitOfMeasure: z.string().max(10).optional(),
  category: z.string().max(50).optional(),
  unit: z.string().max(10).optional(),
  stockCharacteristics: z.array(z.string()).optional(),
})

export type ProductCreateForm = z.infer<typeof productCreateSchema>
