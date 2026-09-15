import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url
      } catch {}
      return url.startsWith("/") ? url : baseUrl
    },
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
        token.tenantId = user.tenantId
        token.tenantName = user.tenantName
        token.tenantCode = user.tenantCode
        token.store_ids = user.store_ids
        token.storeIds = user.storeIds
        token.can_manage_subscription = user.can_manage_subscription
        token.is_root_owner = user.is_root_owner
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
      session.user.tenantId = t.tenantId
      session.user.tenantName = t.tenantName
      session.user.tenantCode = t.tenantCode
      session.user.store_ids = t.store_ids
      session.user.storeIds = t.storeIds
      session.user.can_manage_subscription = t.can_manage_subscription
      session.user.is_root_owner = t.is_root_owner
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
