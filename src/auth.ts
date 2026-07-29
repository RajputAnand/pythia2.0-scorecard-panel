import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  // Required on any host that isn't Vercel/Cloudflare Pages (e.g. AWS Amplify) —
  // without it, auth.js throws UntrustedHost on every request in production
  // because it won't trust the incoming Host header by default.
  trustHost: true,
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
        token.pythia2Token = user.pythia2Token
        token.refreshToken = user.refreshToken
        token.score = user.score
        token.jobTitle = user.jobTitle
        token.points = user.points
      }
      return token
    },
    session({ session, token }) {
      const t = token as import("next-auth/jwt").JWT
      session.user.role = t.role
      session.user.initials = t.initials
      session.user.token = t.token
      session.user.pythia2Token = t.pythia2Token
      session.user.refreshToken = t.refreshToken
      session.user.score = t.score
      session.user.jobTitle = t.jobTitle
      session.user.points = t.points || 0
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
