import { z } from 'zod'

export const PropertyCreateSchema = z.object({
  name: z.string().min(3),
  location: z.string().optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
})

export const PropertyUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  location: z.string().optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
})

export type PropertyCreateInput = z.infer<typeof PropertyCreateSchema>
export type PropertyUpdateInput = z.infer<typeof PropertyUpdateSchema>
