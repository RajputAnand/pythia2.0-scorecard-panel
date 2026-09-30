'use client'

import { useSession } from 'next-auth/react'
import headerStyles from '@/components/shared/Header/Header.module.css'
import Toolbar from '@/components/shared/Toolbar/Toolbar'
import { useToast } from '@/context/ToastContext'
import { useStaffingStore } from '@/store/staffingStore'
import { addDaysToDateString } from '@/lib/staffing-transform'
import { formatDateRange } from '@/utils/common'

/**
 * StaffingToolbar — sticky subheader toolbar below <Header> reusing the shared
 * <Toolbar> component (@/components/shared/Toolbar/Toolbar).
 *
 * Reads/dispatches useStaffingStore directly so this client component and
 * StaffingPageContent share the same week/schedule state without prop drilling.
 *
 * Left slot:
 *   - Calendar week range badge (e.g. "Sep 29 – Oct 05, 2026")
 *   - Previous week / Next week navigation buttons
 * Right slot:
 *   - "✦ Generate Schedule" button
 *   - "↻ Refresh Recommendations" button
 *   - "Publish Schedule" primary action button
 */
export default function StaffingToolbar() {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token
  const { showToast } = useToast()

  const weekStartDate = useStaffingStore((s) => s.weekStartDate)
  const loading = useStaffingStore((s) => s.loading)
  const publishing = useStaffingStore((s) => s.publishing)
  // Tied to this client's own poll loop, not the server's generationStatus — see the
  // comment on pollingRecommendations in staffingStore.ts for why: generationStatus can
  // stay "generating" longer than this client waits, which would otherwise leave the
  // button permanently disabled.
  const isGeneratingRecommendations = useStaffingStore((s) => s.pollingRecommendations)
  const generateSchedule = useStaffingStore((s) => s.generateSchedule)
  const generateRecommendations = useStaffingStore((s) => s.generateRecommendations)
  const publishSchedule = useStaffingStore((s) => s.publishSchedule)
  const goToPreviousWeek = useStaffingStore((s) => s.goToPreviousWeek)
  const goToNextWeek = useStaffingStore((s) => s.goToNextWeek)

  const handlePublish = async () => {
    if (!token) return
    const ok = await publishSchedule(token)
    showToast(ok ? 'Schedule published' : 'Failed to publish schedule')
  }

  const weekLabel = weekStartDate
    ? formatDateRange(weekStartDate, addDaysToDateString(weekStartDate, 6))
    : 'Current Week'

  return (
    <Toolbar
      left={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-secondary bg-surface-alt border border-border rounded-lg px-2.5 py-1.5">
            <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="font-sans font-medium text-primary">{weekLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => token && goToPreviousWeek(token)}
            disabled={loading || !weekStartDate}
            className="cursor-pointer p-1.5 rounded-md border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-alt disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous week"
            aria-label="Previous week"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => token && goToNextWeek(token)}
            disabled={loading || !weekStartDate}
            className="cursor-pointer p-1.5 rounded-md border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-alt disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next week"
            aria-label="Next week"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      }
      right={
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => token && generateSchedule(token)}
            disabled={loading || !weekStartDate}
            className={headerStyles.btnGhost}
          >
            {loading ? 'Generating…' : '✦ Generate Schedule'}
          </button>
          <button
            type="button"
            onClick={() => token && generateRecommendations(token)}
            disabled={isGeneratingRecommendations || !weekStartDate}
            className={headerStyles.btnGhost}
          >
            {isGeneratingRecommendations ? 'Refreshing…' : '↻ Refresh Recommendations'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || !weekStartDate}
            className={headerStyles.btnAccent}
          >
            {publishing ? 'Publishing…' : 'Publish Schedule'}
          </button>
        </div>
      }
    />
  )
}
