import { z } from "zod"

export const createEmployeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.union([z.literal(''), z.email("Invalid email")]).optional(),
    phone: z.string().optional(),
})

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>
