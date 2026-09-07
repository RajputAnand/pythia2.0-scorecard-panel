import { z } from 'zod'

export const createSwagProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Reward name must be at least 2 characters.')
    .max(80, 'Reward name cannot exceed 80 characters.')
    .trim(),
  desc: z
    .string()
    .min(5, 'Description must be at least 5 characters.')
    .max(250, 'Description cannot exceed 250 characters.')
    .trim(),
  cost: z
    .number({ message: 'Points cost must be a valid number' })
    .int('Points cost must be a whole number')
    .min(10, 'Points cost must be at least 10 pts.')
    .max(100000, 'Points cost cannot exceed 100,000 pts.'),
  emoji: z
    .string()
    .min(1, 'Please select or enter an emoji / icon.')
    .max(8, 'Emoji / icon is too long.'),
  category: z
    .string()
    .min(1, 'Please select a category.')
    .trim(),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .optional()
    .nullable(),
})

export type CreateSwagProductSchema = z.infer<typeof createSwagProductSchema>
