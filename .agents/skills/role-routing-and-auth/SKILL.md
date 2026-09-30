---
name: role-routing-and-auth
description: >-
  Guide for role-based access control, Auth.js (NextAuth v5) session handling, multi-tenant login & routing, proxy.ts route protection, multi-role sidebar navigation, and store switching in Pythia 2.0.
---

# Role-Based Routing, Auth & Sidebar Guide

Pythia 2.0 implements a strict multi-role permission and authentication system using Auth.js (NextAuth v5) and Next.js 16 Proxy (`proxy.ts`), with optional Multi-Tenant architecture support.

## The 4-Role System

| Role | Allowed Route Prefixes | Default Landing Route | Dedicated Login Page |
|---|---|---|---|
| `employee` | `/dashboard` | `/dashboard/overview` | `/login/employee` |
| `manager` | `/manager` | `/manager/coaching-tracker` | `/login/manager` |
| `owner` | `/owner`, `/manager` | `/owner/roi-attribution` | `/login/owner` |
| `superadmin` | `/super-admin` | `/super-admin/kpi-visibility` | `/login/superadmin` |

- **Owners** oversee managers, hence they have access to both `/owner/*` and `/manager/*`.
- **Managers** cannot access `/owner/*`.
- **Employees** are strictly restricted to `/dashboard/*`.
- **Super Admins** have access to all `/super-admin/*` tools and mirror views.

---

## Session & JWT Architecture

Auth configuration is located in [`src/auth.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/auth.ts).

### Session User Shape
```ts
interface User {
  id: string
  email: string
  name: string
  role: 'employee' | 'manager' | 'owner' | 'superadmin'
  initials: string
  token: string           // API Bearer token
  pythia2Token: string    // Alias to Bearer token
  refreshToken: string    // For 401 refresh interceptor
  score?: number | null   // Initial employee score
  jobTitle?: string       // E.g. "Sales Associate"
  points?: number         // Swag points balance
}
```

### Accessing Auth State
- **Server Components / Actions**:
  ```ts
  import { auth } from '@/auth'
  const session = await auth()
  const token = session?.user?.pythia2Token
  ```
- **Client Components**:
  ```tsx
  import { useSession } from 'next-auth/react'
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  ```

### Two-Tier Token Refresh System (`src/lib/auth-token.ts`, `src/auth.ts`, `src/lib/api-client.ts`)
1. **Proactive Refresh (NextAuth `jwt` Callback)**:
   - Pythia 2.0 access tokens expire after 15 minutes.
   - The NextAuth `jwt` callback parses token expiration without third-party dependencies (`getJwtExp`) and checks `isTokenExpired(token.pythia2Token, 60_000)`.
   - If expiring within 60s, it proactively issues a single-flight token rotation via `requestTokenRefresh(token.refreshToken)` (`POST /auth/refresh`).
   - Role `manager` authenticates against Pythia 1 and is excluded from refresh rotation.
2. **Reactive 401 Interceptor (`pythia2Client`)**:
   - Catches 401 responses on authenticated requests.
   - Coalesces parallel requests into a single refresh promise to prevent revoking the refresh token family.
   - Updates the client session via `signIn('credentials', { userData: ..., redirect: false })`, marks the request with `_retriedAfterRefresh = true`, and retries the failed request with the new Bearer token.
   - If refresh fails, signs out and redirects to the role login page.
3. **URL Normalization**:
   - All direct requests to `process.env.NEXT_PUBLIC_PYTHIA_2_API_URL` must normalize base URLs with `.replace(/\/+$/, '')` to prevent double-slash 404s (`//auth/refresh`).
4. **Infinite Loop Prevention on 401 / Revocation**:
   - If `POST /auth/refresh` responds with HTTP 401, 403, 400, or 404, the refresh token is blacklisted in-memory via `failedRefreshTokens` (`src/lib/auth-token.ts`) to immediately halt duplicate network requests.
   - In `src/auth.ts`, when refresh fails (`token.error = "RefreshAccessTokenError"`), `delete token.refreshToken` and `delete token.accessTokenExpires` are executed so subsequent session evaluations do not loop or re-trigger refresh with a dead token.
   - In `src/lib/api-client.ts`, `config._retriedAfterRefresh = true` is set immediately before attempting refresh to prevent request re-entry.

---

## Next.js 16 Proxy Gatekeeper (`src/proxy.ts`)

`src/proxy.ts` executes on every incoming request:
1. **Unauthenticated Users**: Allows `/login/employee`, `/login/manager`, `/login/owner`, `/login/superadmin`, `/forgot-password`, `/reset-password`. Redirects any other route to login with `redirectTo=<path>`.
2. **Authenticated Users on Public Routes**: Redirects `/login` or `/` to the role's `ROLE_DEFAULT_ROUTES[role]`.
3. **Prefix Guard**: Checks `pathname.startsWith(allowedPrefix)`. Redirects unauthorized accesses to the default route.
4. **KPI Visibility Gate (`isPageHiddenByAdmin`)**: If the path is a registered page in `PAGE_REGISTRY` and has been turned off by Super Admin, redirects to the role's default route.

---

## Sidebar Architecture (`src/components/shared/Sidebar/Sidebar.tsx`)

Sidebar is rendered per role via the role layout (`src/app/<role>/layout.tsx`):

1. **Employee View**:
   - Navigation: My Dashboard.
   - Bottom Widget: Employee initials avatar, Name, Job Title, live `currentScore` from `userStore` (falls back to `user.score`), and Swag Points badge.
2. **Manager View**:
   - Navigation: Navigate (Dashboard, Employees) + Manager Tools (Coaching Tracker, Staffing, Unknown Identity, Video Identities).
   - Bottom Widget: Store selection pill with pulsing live dot (`useUserStore(s => s.currentStore)`).
3. **Owner View**:
   - Navigation: Owner Tools (Stores, Managers, ROI Attribution, Benchmarking).
   - View Toggle: Swappable Owner View / Manager View buttons that update route and swap active nav items.
   - Bottom Widget: Store selection pill.
4. **Super Admin View**:
   - 4-Way View Switcher: `Admin` (KPI Visibility, Device Health, Post-Demo Recaps), `Manager View`, `Employee View`, `Owner View` (Stores mirror, Managers mirror, ROI, Benchmarking).
   - URL Sync: Synchronizes active toggle with current URL path automatically.

---

## Owner Billing & Stripe Customer Portal

Owners have direct access to Stripe Customer Portal for managing payment methods, viewing invoices, and updating billing details:
- **Server Action**: `createStripeCustomerPortalSession(returnUrl?: string)` in [`src/actions/stripe.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/actions/stripe.ts).
- **Header Trigger**: Rendered in [`src/components/shared/Header/Header.tsx`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/components/shared/Header/Header.tsx) user profile dropdown when `role === 'owner'`:
  ```tsx
  <button onClick={handleManagePayments} disabled={isOpeningPortal}>
    {isOpeningPortal ? 'Opening Portal...' : 'Manage Payment methods'}
  </button>
  ```
- **Fallback / Environment**:
  - `STRIPE_CUSTOMER_PORTAL_URL`: Direct link override if hosted URL is static.
  - `STRIPE_SECRET_KEY`: Used to call `stripe.billingPortal.sessions.create({ customer: customerId, return_url })`.
  - Default return URL routes back to `/owner/roi-attribution`.

