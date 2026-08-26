import { unstable_rethrow } from 'next/navigation'
import OverviewContent from '@/components/OverviewContent/OverviewContent'
import { fetchOverview } from '@/queries/overview'
import { fetchCoachingMoments, fetchDashboardSummary, fetchShiftHighlights } from '@/queries/scorecard'
import { auth } from '@/auth'
import type { CoachingMoment, DashboardSummaryResponse, OverviewPageData } from '@/types/overview'
import type { ShiftHighlight } from '@/types/shift'
import { extractApiErrorMessage } from '@/utils/common'

export default async function OverviewPage() {
  let overview: OverviewPageData | null = null
  const [overviewResult] = await Promise.allSettled([fetchOverview()])
  if (overviewResult.status === 'rejected') {
    console.log(overviewResult.reason)
  } else {
    overview = overviewResult.value
  }

  const session = await auth()
  let initialSummary: DashboardSummaryResponse | null = null
  let initialError: string | null = null
  let coachingMoments: CoachingMoment[] = []
  let coachingGenerationInProgress = false
  let initialShiftHighlights: ShiftHighlight[] = []
  let initialShiftHighlightsGenerating = false

  if (session?.user?.pythia2Token) {
    const token = session.user.pythia2Token

    const [summaryResult, coachingResult] = await Promise.allSettled([
      fetchDashboardSummary({ token, weekOffset: 0 }),
      fetchCoachingMoments(token),
    ])

    if (summaryResult.status === 'rejected') {
      unstable_rethrow(summaryResult.reason)
      initialError = extractApiErrorMessage(summaryResult.reason, 'Unable to load your dashboard. Please try again.')
    } else {
      initialSummary = summaryResult.value
    }

    if (coachingResult.status === 'rejected') {
      unstable_rethrow(coachingResult.reason)
      console.log(coachingResult.reason)
    } else {
      coachingMoments = coachingResult.value.items
      coachingGenerationInProgress = coachingResult.value.generationInProgress
    }

    const shiftStart = initialSummary?.today?.shift_start
    const shiftStatus = initialSummary?.today?.data.shift_status
    if (shiftStart && shiftStatus && shiftStatus !== 'no_data') {
      try {
        const highlightsResult = await fetchShiftHighlights({ token, shiftStart, shiftStatus })
        initialShiftHighlights = highlightsResult.items
        initialShiftHighlightsGenerating = highlightsResult.generationInProgress
      } catch (err) {
        unstable_rethrow(err)
        console.log(err)
      }
    }
  }

  return (
    <OverviewContent
      overview={overview}
      initialSummary={initialSummary}
      initialError={initialError}
      coachingMoments={coachingMoments}
      coachingGenerationInProgress={coachingGenerationInProgress}
      initialShiftHighlights={initialShiftHighlights}
      initialShiftHighlightsGenerating={initialShiftHighlightsGenerating}
    />
  )
}
