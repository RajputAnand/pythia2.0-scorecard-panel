---
name: data-fetching-and-queries
description: >-
  Guide for adding and consuming API endpoints, queries, Server Component SSR data fetching with unstable_rethrow, client-side data fetching with AbortController, and mock-to-real API migration in Pythia 2.0.
---

# Data Fetching and Queries Guide

Pythia 2.0 frontend uses a unified architecture for fetching data without any third-party cache library (TanStack Query is strictly omitted).

## Core Principles

1. **HTTP Client**: Always use `pythia2Client` from [`src/lib/api-client.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/lib/api-client.ts). Never use raw `fetch` in queries or actions.
2. **Centralized Endpoints**: All API paths are registered in [`src/utils/api-endpoints.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/utils/api-endpoints.ts) under `PYTHIA_2_API`.
3. **Dedicated Query Modules**: Pure async functions reside in `src/queries/<domain>.ts`.
4. **Error Handling**: Use `extractApiErrorMessage` from [`src/utils/common.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/utils/common.ts) to parse FastAPI validation errors and 400/401/422 responses.

---

## Registered Query Modules

1. `admin-config.ts`: `fetchFieldConfigs`, `updateFieldConfig`.
2. `benchmarking.ts`: `fetchAllStoreData`, `fetchNetworkIntelligence`.
3. `demographics.ts`: `fetchAgeDistribution`, `fetchGenderDistribution`, `fetchCustomerSegments`.
4. `device-health.ts`: `fetchDeviceStates`, `fetchDeviceDetail`, `getDeviceStatesWsUrl`.
5. `employees.ts`: `fetchEmployees`, `createEmployee`, `fetchArchivedEmployees`, `fetchEmployee`, `fetchEmployeeCredentials`, `archiveEmployee`, `unarchiveEmployee`.
6. `manager-coaching.ts`: `fetchManagerCoachingPlans`, `fetchManagerCoachingPlan`, `applyManagerPlanAction`, `fetchCoachingSummary`, `fetchCoachingEffectiveness`, `fetchCoachingEmployees`, `fetchEmployeeCoachingDetail`.
7. `manager-dashboard.ts`: `fetchManagerDashboardSummary`, `fetchManagerDashboardLeaderboard`, `fetchManagerDashboardTrend`.
8. `managers.ts`: `fetchManagers`, `fetchArchivedManagers`, `createManager`, `fetchManagerCredentials`, `archiveManager`, `unarchiveManager`.
9. `overview.ts`: `fetchOverview`.
10. `owner-roi.ts`: `fetchRoiAttribution`, `shareRoiAttributionPdf`.
11. `scorecard.ts`: `fetchDashboardSummary`, `fetchShiftHighlights`, `fetchCoachingMoments`.
12. `staffing.ts`: `fetchStaffingSchedule`, `createStaffingShift`, `updateStaffingShift`, `deleteStaffingShift`, `generateStaffingSchedule`, `publishStaffingSchedule`, `fetchStaffingRoster`, `fetchStaffingHeatmap`, `fetchStaffingInsights`, `fetchStaffingRecommendations`, `generateStaffingRecommendations`, `applyStaffingRecommendation`, `dismissStaffingRecommendation`.
13. `unknown-identities.ts`: `fetchUnknownIdentities`, `fetchUnknownIdentitiesCount`, `fetchTrashedIdentities`, `assignUnknownIdentity`, `trashUnknownIdentity`, `restoreUnknownIdentity`.
14. `video-identities.ts`: `fetchVideoIdentities`, `fetchVideoIdentityStats`, `presignVideoIdentityKeys`.
15. `tenants.ts` **(Multi-Tenant)**: `fetchTenants`, `fetchTenantDetail`, `createTenant`, `updateTenantStatus`, `updateTenantChecklist`.
16. `stores.ts` **(Multi-Tenant / Owner)**: `fetchStoresForTenant`, `createStore`, `bulkCreateStores`, `simulateStoreHeartbeat`, `updateStore`.
17. `owners.ts` **(Multi-Tenant / Super Admin)**: `fetchOwners`, `fetchArchivedOwners`, `createOwner`, `fetchOwnerCredentials`, `archiveOwner`, `unarchiveOwner`.
18. `onboarding.ts` **(Customer Onboarding)**: `fetchOnboardingWizardState`, `updateOnboardingStep`, `completeOnboarding`.

---

## Server Component (SSR) Fetching Patterns

Page components (`page.tsx`) run on the server and fetch data directly before rendering.

### Pattern 1: Sequential `try/catch` with `unstable_rethrow`
Used in employee dashboard pages:
```tsx
import { unstable_rethrow } from 'next/navigation'
import { auth } from '@/auth'
import { fetchDashboardSummary } from '@/queries/scorecard'

export default async function OverviewPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let summary = null
  if (token) {
    try {
      summary = await fetchDashboardSummary({ token, weekOffset: 0 })
    } catch (err) {
      // CRITICAL: Next.js redirects (e.g. 401 session expiry) throw NEXT_REDIRECT errors.
      // An ordinary catch will swallow this unless unstable_rethrow is called first!
      unstable_rethrow(err)
      console.error('Failed to fetch summary:', err)
    }
  }

  return <OverviewContent initialSummary={summary} />
}
```

### Pattern 2: Parallel `Promise.allSettled` with Rejected Rethrow Loop
Used in manager, owner, and super-admin pages fetching multiple endpoints concurrently:
```tsx
import { unstable_rethrow } from 'next/navigation'
import { auth } from '@/auth'
import { fetchTenants } from '@/queries/tenants'
import { fetchStoresForTenant } from '@/queries/stores'

export default async function SuperAdminTenantsPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let tenants = null
  let stores = null

  if (token) {
    const results = await Promise.allSettled([
      fetchTenants({ token, skip: 0, limit: 15 }),
      fetchStoresForTenant({ token }),
    ])

    // Re-throw any NEXT_REDIRECT errors
    for (const result of results) {
      if (result.status === 'rejected') {
        unstable_rethrow(result.reason)
      }
    }

    if (results[0].status === 'fulfilled') tenants = results[0].value
    if (results[1].status === 'fulfilled') stores = results[1].value
  }

  return <TenantListPanel initialData={tenants} />
}
```

---

## Client-Side Fetching Pattern (Interactive / Search / Polling)

For components fetching on search, pagination, or button actions:

```tsx
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { fetchEmployees } from '@/queries/employees'
import { extractApiErrorMessage } from '@/utils/common'

export function EmployeeSearch() {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [search, setSearch] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    let cancelled = false

    setLoading(true)
    fetchEmployees({ token, search, signal: controller.signal })
      .then((res) => {
        if (cancelled) return
        setData(res.data)
        setError(null)
      })
      .catch((err) => {
        if (cancelled || axios.isCancel(err)) return
        setError(extractApiErrorMessage(err, 'Failed to load employees'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [token, search])

  return <div>...</div>
}
```

---

## Mock-to-Real API Transition

When an endpoint is not yet available on the backend:
1. Place mock generator in `src/mock/<domain>APIs.ts`.
2. Wrap the mock calls inside `src/queries/<domain>.ts` with identical async function signatures matching `pythia2Client` endpoints.
3. Consuming UI components import only from `src/queries/<domain>.ts`.
4. When backend is ready, replace mock implementation in `src/queries/<domain>.ts` with `pythia2Client` call without changing UI code.
