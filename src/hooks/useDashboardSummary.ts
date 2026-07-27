'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { fetchDashboardSummary } from '@/queries/scorecard'
import type { DashboardSummaryResponse } from '@/types/overview'
import { extractApiErrorMessage, formatWeekRange, getWeekSubtitle } from '@/utils/common'

interface UseDashboardSummaryArgs {
  initialSummary: DashboardSummaryResponse | null
  initialError: string | null
  initialWeekOffset?: number
}

interface UseDashboardSummaryResult {
  summary: DashboardSummaryResponse | null
  error: string | null
  loading: boolean
  weekOffset: number
  weekLabel: string
  goToPreviousWeek: () => void
  goToNextWeek: () => void
}

// Shared by every dashboard route that renders week-scoped data (overview,
// leaderboard, progress). `initialWeekOffset` must match whatever weekOffset
// the caller's page.tsx used for its server-seeded fetch (avoids a loading
// flash on first paint) — leaderboard/progress default to 1 (last week),
// since the current week has no data yet mid-week for most employees;
// overview defaults to 0 (current week) instead. Navigation is capped to
// just these two weeks (offset 0 and 1); every weekOffset change fetches
// client-side, aborting any still-in-flight request first.
export function useDashboardSummary({
  initialSummary,
  initialError,
  initialWeekOffset = 1,
}: UseDashboardSummaryArgs): UseDashboardSummaryResult {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [weekOffset, setWeekOffset] = useState(initialWeekOffset)
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(initialSummary)
  const [error, setError] = useState<string | null>(initialError)
  const [loading, setLoading] = useState(false)
  const isFirstRun = useRef(true)

  useEffect(() => {
    // initialWeekOffset was already fetched server-side on mount.
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    if (!token) return

    const controller = new AbortController()
    let cancelled = false
    setLoading(true)

    fetchDashboardSummary({ token, weekOffset, signal: controller.signal })
      .then((data) => {
        if (cancelled) return
        setSummary(data)
        setError(null)
      })
      .catch((err) => {
        if (cancelled || axios.isCancel(err)) return
        setSummary(null)
        setError(extractApiErrorMessage(err, 'Unable to load dashboard data. Please try again.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [weekOffset, token])

  const weekLabel = summary
    ? formatWeekRange(summary.weekly.week_start, summary.weekly.week_end)
    : (() => {
        const refDate = new Date()
        refDate.setDate(refDate.getDate() - 7 * weekOffset)
        return getWeekSubtitle(refDate)
      })()

  return {
    summary,
    error,
    loading,
    weekOffset,
    weekLabel,
    goToPreviousWeek: () => setWeekOffset((n) => Math.min(1, n + 1)),
    goToNextWeek: () => setWeekOffset((n) => Math.max(0, n - 1)),
  }
}
