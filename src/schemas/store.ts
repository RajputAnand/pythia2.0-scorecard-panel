import { z } from "zod"

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

