import { z } from "zod"

// Text fields only — the store assignment is handled by CreateManagerModal's
// own multi-select state (DynamicForm has no multi-select field type), and is
// validated there before submit.
export const createManagerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.union([z.literal(''), z.email("Invalid email")]).optional(),
    phone: z.string().optional(),
})

export type CreateManagerSchema = z.infer<typeof createManagerSchema>
