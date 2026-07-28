import { z } from "zod"

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
})

export type LoginSchema = z.infer<typeof loginSchema>

// Employee accounts aren't guaranteed to have a valid email on file, so the
// employee login form only requires the field to be non-empty.
export const employeeLoginSchema = z.object({
    email: z.string().min(1, "Email is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
})

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
