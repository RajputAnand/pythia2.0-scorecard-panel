import { DefaultSession } from "next-auth"
import { UserRole } from "./user"

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"]
    error?: string
  }

  interface User {
    role: UserRole
    initials: string
    token?: string
    pythia2Token?: string
    refreshToken?: string
    accessTokenExpires?: number | null
    score?: number
    jobTitle?: string
    points: number
    tenantId?: string
    tenantName?: string
    tenantCode?: string
    store_ids?: string[]
    storeIds?: string[]
    can_manage_subscription?: boolean
    is_root_owner?: boolean
    first_login?: boolean
    isDemo?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    initials: string
    token?: string
    pythia2Token?: string
    refreshToken?: string
    accessTokenExpires?: number | null
    error?: string
    score?: number
    jobTitle?: string
    points?: number
    tenantId?: string
    tenantName?: string
    tenantCode?: string
    store_ids?: string[]
    storeIds?: string[]
    can_manage_subscription?: boolean
    is_root_owner?: boolean
    first_login?: boolean
    isDemo?: boolean
  }
}
