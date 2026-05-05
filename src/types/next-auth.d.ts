import { DefaultSession } from "next-auth"
import { UserRole, Store } from "./user"

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole
      initials: string
      score?: number
      jobTitle?: string
      storeName?: string
      storeLoc?: string
      nodesOnline?: number
      stores?: Store[]
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    initials: string
    score?: number
    jobTitle?: string
    storeName?: string
    storeLoc?: string
    nodesOnline?: number
    stores?: Store[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    initials: string
    score?: number
    jobTitle?: string
    storeName?: string
    storeLoc?: string
    nodesOnline?: number
    stores?: Store[]
  }
}
