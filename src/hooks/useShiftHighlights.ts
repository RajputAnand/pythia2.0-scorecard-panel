'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { fetchShiftHighlights } from '@/queries/scorecard'
import type { ShiftHighlight } from '@/types/shift'

interface UseShiftHighlightsArgs {
  shiftStart?: string
  shiftStatus?: 'complete' | 'in_progress' | 'no_data'
  initialItems: ShiftHighlight[]
  initialGenerationInProgress: boolean
}

interface UseShiftHighlightsResult {
  items: ShiftHighlight[]
  generationInProgress: boolean
}

// Mirrors useDashboardSummary's isFirstRun pattern: shiftStart/shiftStatus are
// already fetched server-side (via page.tsx's initial GET /dashboard/shift-summary/
// highlights call) on mount, so the first render must not re-fetch — only
// subsequent changes (week nav flipping which shift "today" resolves to) do.
export function useShiftHighlights({
  shiftStart,
  shiftStatus,
  initialItems,
  initialGenerationInProgress,
}: UseShiftHighlightsArgs): UseShiftHighlightsResult {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [items, setItems] = useState<ShiftHighlight[]>(initialItems)
  const [generationInProgress, setGenerationInProgress] = useState(initialGenerationInProgress)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    if (!token || !shiftStart || !shiftStatus || shiftStatus === 'no_data') {
      setItems([])
      setGenerationInProgress(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    fetchShiftHighlights({ token, shiftStart, shiftStatus, signal: controller.signal })
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setGenerationInProgress(result.generationInProgress)
      })
      .catch((err) => {
        if (cancelled || axios.isCancel(err)) return
        setItems([])
        setGenerationInProgress(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [shiftStart, shiftStatus, token])

  return { items, generationInProgress }
}
