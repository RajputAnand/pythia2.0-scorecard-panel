import { z } from "zod"

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export const forgotPasswordSchema = z.object({
    email: z.email("Invalid email"),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
