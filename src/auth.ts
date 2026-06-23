import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        userData: {},
      },
      authorize(credentials) {
        if (credentials?.userData) {
          try {
            return JSON.parse(credentials.userData as string)
          } catch (e) {
            console.error("Failed to parse userData in authorize callback:", e)
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.initials = user.initials
        token.token = user.token
        token.score = user.score
        token.jobTitle = user.jobTitle
      }
      return token
    },
    session({ session, token }) {
      const t = token as import("next-auth/jwt").JWT
      session.user.role = t.role
      session.user.initials = t.initials
      session.user.token = t.token
      session.user.score = t.score
      session.user.jobTitle = t.jobTitle
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
