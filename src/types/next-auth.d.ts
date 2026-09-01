import { DefaultSession } from "next-auth"
import { UserRole } from "./user"

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    initials: string
    token?: string
    pythia2Token?: string
    refreshToken?: string
    score?: number
    jobTitle?: string
    points: number
    tenantId?: string
    tenantName?: string
    tenantCode?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    initials: string
    token?: string
    pythia2Token?: string
    refreshToken?: string
    score?: number
    jobTitle?: string
    points?: number
    tenantId?: string
    tenantName?: string
    tenantCode?: string
  }
}
