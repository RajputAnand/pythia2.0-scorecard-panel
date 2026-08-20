import { z } from "zod"

export const shareWithInvestorSchema = z.object({
    email: z.email("Enter a valid email address"),
    note: z.string().max(500, "Note must be 500 characters or fewer").optional(),
})

export type ShareWithInvestorSchema = z.infer<typeof shareWithInvestorSchema>
