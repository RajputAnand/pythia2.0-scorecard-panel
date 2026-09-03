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

## Multi-Tenant Architecture & Feature Flag

Multi-tenant features are gated behind the environment flag `NEXT_PUBLIC_ENABLE_MULTI_TENANT="true"`.

### Environment Flag Behavior
- **Flag Disabled (default)**: The single-tenant flow remains active (`/login/[role]`). Multi-tenant administration routes (`/super-admin/tenants`, `/super-admin/onboarding`, `/super-admin/owners`, `/login/tenant`) are blocked at `proxy.ts`. Store management (`/owner/stores` and `/super-admin/owner/stores`) remains fully accessible to Owners and Super Admins.
- **Flag Enabled (`NEXT_PUBLIC_ENABLE_MULTI_TENANT="true"`)**:
  - Multi-Tenant Login Portal active at `/login/tenant` (accepts Organization ID, Username/Email, Password, and Role).
  - Super Admin Customer Onboarding Wizard active at `/super-admin/onboarding`.
  - Super Admin Tenant Directory active at `/super-admin/tenants`.
  - Super Admin Owner Management active at `/super-admin/owners`.
  - Owner Store Management active at `/owner/stores` (and mirror at `/super-admin/owner/stores`).
  - Super Admin Tenant Switcher dropdown rendered in `Header.tsx`.

### URL Organization ID Prefilling
When accessing `/login/tenant?org=<org_id>` (or `?organizationId=`, `?tenant=`, `?tenantId=`), the Organization ID field automatically prepopulates.

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
  tenantId?: string       // Multi-tenant organization container ID
  tenantName?: string     // Organization display name
  tenantCode?: string     // Tenant slug (e.g. "lionmart")
}
```

### Accessing Auth State
- **Server Components / Actions**:
  ```ts
  import { auth } from '@/auth'
  const session = await auth()
  const token = session?.user?.pythia2Token
  const tenantId = session?.user?.tenantId
  ```
- **Client Components**:
  ```tsx
  import { useSession } from 'next-auth/react'
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const tenantId = session?.user?.tenantId
  ```

---

## Next.js 16 Proxy Gatekeeper (`src/proxy.ts`)

`src/proxy.ts` executes on every incoming request:
1. **Multi-Tenant Feature Gate**: If `NEXT_PUBLIC_ENABLE_MULTI_TENANT` is false, intercepts `/login/tenant`, `/super-admin/onboarding`, `/super-admin/tenants`, `/super-admin/owners` and redirects to the role's default route or `/login/employee`.
2. **Unauthenticated Users**: Allows `/login/employee`, `/login/manager`, `/login/owner`, `/login/superadmin`, `/login/tenant`, `/forgot-password`, `/reset-password`. Redirects any other route to login with `redirectTo=<path>`.
3. **Authenticated Users on Public Routes**: Redirects `/login` or `/` to the role's `ROLE_DEFAULT_ROUTES[role]`.
4. **Prefix Guard**: Checks `pathname.startsWith(allowedPrefix)`. Redirects unauthorized accesses to the default route.
5. **KPI Visibility Gate (`isPageHiddenByAdmin`)**: If the path is a registered page in `PAGE_REGISTRY` and has been turned off by Super Admin, redirects to the role's default route.

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
   - 4-Way View Switcher: `Admin` (Onboarding [if MT], Tenants [if MT], Owners [if MT], KPI Visibility, Device Health), `Manager View`, `Employee View`, `Owner View` (Stores mirror, Managers mirror, ROI, Benchmarking).
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

