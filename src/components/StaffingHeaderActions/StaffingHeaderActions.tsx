'use client'

import { useSession } from 'next-auth/react'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { useToast } from '@/context/ToastContext'
import { useStaffingStore } from '@/store/staffingStore'

/**
 * Generate Schedule / Refresh Recommendations / Publish Schedule — rendered
 * inside <Header>'s children slot. Reads/dispatches useStaffingStore directly
 * (no props) so this client component and StaffingPageContent (a sibling under
 * the server page.tsx) share the same week/schedule state without prop
 * drilling, per AGENTS.md's Zustand convention for state shared across
 * unrelated components.
 *
 * Prev Week / Next Week are hidden for now (not removed from the store —
 * useStaffingStore.goToPreviousWeek/goToNextWeek still work, just nothing
 * currently renders a button for them).
 */
export default function StaffingHeaderActions() {
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

  const handlePublish = async () => {
    if (!token) return
    const ok = await publishSchedule(token)
    showToast(ok ? 'Schedule published' : 'Failed to publish schedule')
  }

  return (
    <>
      <button
        onClick={() => token && generateSchedule(token)}
        disabled={loading || !weekStartDate}
        className={headerStyles.btnGhost}
      >
        {loading ? 'Generating…' : '✦ Generate Schedule'}
      </button>
      <button
        onClick={() => token && generateRecommendations(token)}
        disabled={isGeneratingRecommendations || !weekStartDate}
        className={headerStyles.btnGhost}
      >
        {isGeneratingRecommendations ? 'Refreshing…' : '↻ Refresh Recommendations'}
      </button>
      <button onClick={handlePublish} disabled={publishing || !weekStartDate} className={headerStyles.btnAccent}>
        {publishing ? 'Publishing…' : 'Publish Schedule'}
      </button>
    </>
  )
}
