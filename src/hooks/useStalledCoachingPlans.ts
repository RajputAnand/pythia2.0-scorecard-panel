'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { fetchManagerCoachingPlans } from '@/queries/manager-coaching'
import { fetchEmployee } from '@/queries/employees'
import { getEmployeeName, getEmployeeInitials } from '@/utils/common'
import type { ApiEmployee } from '@/types/employee'
import type { ManagerCoachingPlan } from '@/types/coaching-plan'

export interface StalledEmployeeGroup {
  userId: string
  name: string
  initials: string
  plans: ManagerCoachingPlan[]
}

export interface UseStalledCoachingPlansResult {
  isLoading: boolean
  isError: boolean
  groups: StalledEmployeeGroup[]
  /** Plans still needing action (not resolved, not dismissed) — the real "stalled issues" count. */
  openCount: number
  retry: () => void
  /** Merge a plan returned by a resolve/edit action into local state, e.g. after applyManagerPlanAction. */
  patchPlan: (updated: ManagerCoachingPlan) => void
}

// Shared by CoachingTrackerPanel (the "View all" alert banner — count + who's
// affected) and StalledPlansPanel (the popup's full detail view), so both
// reflect the exact same live data instead of drifting or double-implementing
// the fetch/group logic.
export function useStalledCoachingPlans(): UseStalledCoachingPlansResult {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [plans, setPlans] = useState<ManagerCoachingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
  const [employeesById, setEmployeesById] = useState<Record<string, ApiEmployee>>({})

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setIsLoading(true)
    setIsError(false)
    // Ask the API for exactly the statuses this view cares about — resolved
    // and dismissed plans are never relevant here, no reason to fetch them
    // just to filter them out client-side.
    fetchManagerCoachingPlans({ token, status: ['open', 'acknowledged', 'in_progress'] })
      .then((result) => {
        if (!cancelled) setPlans(result)
      })
      .catch(() => {
        if (!cancelled) setIsError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, retryToken])

  // Resolve employee display info for every user_id referenced by a plan —
  // the manager-coaching endpoints only return user_id, not a display name.
  useEffect(() => {
    if (!token) return
    const missingIds = Array.from(new Set(plans.map((p) => p.user_id))).filter((id) => !employeesById[id])
    if (missingIds.length === 0) return
    let cancelled = false
    Promise.all(missingIds.map((userId) => fetchEmployee({ token, userId }).catch(() => null))).then(
      (results) => {
        if (cancelled) return
        setEmployeesById((prev) => {
          const next = { ...prev }
          results.forEach((employee, i) => {
            if (employee) next[missingIds[i]] = employee
          })
          return next
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [plans, employeesById, token])

  // The fetch above already asks the API for only open/acknowledged/in_progress
  // plans — this re-filter is what actually removes a plan from view the moment
  // patchPlan merges in a "resolved" result from resolvePlan/saveEdit, without
  // needing a refetch.
  const visiblePlans = useMemo(
    () => plans.filter((p) => p.status !== 'dismissed' && p.status !== 'resolved'),
    [plans],
  )

  const groups = useMemo(() => {
    const byUser = new Map<string, ManagerCoachingPlan[]>()
    for (const plan of visiblePlans) {
      const arr = byUser.get(plan.user_id) ?? []
      arr.push(plan)
      byUser.set(plan.user_id, arr)
    }
    return Array.from(byUser.entries())
      .map(([userId, userPlans]) => {
        const employee = employeesById[userId]
        const sortedPlans = [...userPlans].sort((a, b) => a.created_at.localeCompare(b.created_at))
        return {
          userId,
          name: employee ? getEmployeeName(employee) : userId,
          initials: employee ? getEmployeeInitials(employee) : '?',
          plans: sortedPlans,
        }
      })
      .sort((a, b) => (a.plans[0]?.created_at ?? '').localeCompare(b.plans[0]?.created_at ?? ''))
  }, [visiblePlans, employeesById])

  const openCount = visiblePlans.length

  return {
    isLoading,
    isError,
    groups,
    openCount,
    retry: () => setRetryToken((n) => n + 1),
    patchPlan: (updated) => setPlans((prev) => prev.map((p) => (p.plan_id === updated.plan_id ? updated : p))),
  }
}
