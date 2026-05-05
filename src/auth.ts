import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DEMO_USERS } from "@/lib/demo-user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize(credentials) {
        const user = DEMO_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )
        if (!user) return null
        return {
          id: user.email,
          email: user.email,
          name: user.name,
          role: user.role,
          initials: user.initials,
          score: user.score,
          jobTitle: user.jobTitle,
          storeName: user.storeName,
          storeLoc: user.storeLoc,
          nodesOnline: user.nodesOnline,
          stores: user.stores,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.initials = user.initials
        token.score = user.score
        token.jobTitle = user.jobTitle
        token.storeName = user.storeName
        token.storeLoc = user.storeLoc
        token.nodesOnline = user.nodesOnline
        token.stores = user.stores
      }
      return token
    },
    session({ session, token }) {
      const t = token as import("next-auth/jwt").JWT
      session.user.role = t.role
      session.user.initials = t.initials
      session.user.score = t.score
      session.user.jobTitle = t.jobTitle
      session.user.storeName = t.storeName
      session.user.storeLoc = t.storeLoc
      session.user.nodesOnline = t.nodesOnline
      session.user.stores = t.stores
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
