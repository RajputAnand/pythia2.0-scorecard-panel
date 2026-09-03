import { z } from "zod"

export const createTenantSchema = z.object({
  name: z.string().min(2, "Company / Tenant name is required"),
  code: z
    .string()
    .min(2, "Identifier is required")
    .regex(/^[a-z0-9-]+$/, "Identifier must be lowercase letters, numbers, and hyphens only"),
  primaryContactName: z.string().min(2, "Primary contact name is required"),
  primaryContactEmail: z.string().email("Invalid contact email"),
  primaryContactPhone: z.string().optional(),
  plan: z.enum(["standard", "growth", "enterprise", "custom"]),
  storeAllowance: z.coerce.number().min(1, "Store allowance must be at least 1"),
  defaultTimezone: z.string().min(1, "Default timezone is required"),
  defaultLocale: z.string().min(1, "Default locale is required"),
})

export type CreateTenantSchema = z.infer<typeof createTenantSchema>

export const createStoreSchema = z.object({
  storeNo: z.string().min(1, "Store number / code is required"),
  name: z.string().min(2, "Store name is required"),
  location: z.string().min(2, "Location is required"),
  district: z.string().min(1, "District is required"),
  fullAddress: z.string().min(5, "Complete store address is required for edge device delivery"),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  pairingCode: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
})

export type CreateStoreSchema = z.infer<typeof createStoreSchema>

export const createOwnerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

export type CreateOwnerSchema = z.infer<typeof createOwnerSchema>

export const tenantLoginSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(4, "Password is required"),
})

export type TenantLoginSchema = z.infer<typeof tenantLoginSchema>

