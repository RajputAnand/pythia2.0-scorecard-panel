import { DefaultSession } from "next-auth"
import { UserRole } from "./user"

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole
      initials: string
      token?: string
      score?: number
      jobTitle?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    initials: string
    token?: string
    score?: number
    jobTitle?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    initials: string
    token?: string
    score?: number
    jobTitle?: string
  }
}
