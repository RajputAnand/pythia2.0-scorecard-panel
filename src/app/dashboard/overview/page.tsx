import { unstable_rethrow } from 'next/navigation'
import OverviewContent from '@/components/OverviewContent/OverviewContent'
import { fetchOverview } from '@/queries/overview'
import { fetchCoachingMoments, fetchDashboardSummary } from '@/queries/scorecard'
import { auth } from '@/auth'
import type { CoachingMoment, DashboardSummaryResponse, OverviewPageData } from '@/types/overview'
import { extractApiErrorMessage } from '@/utils/common'

export default async function OverviewPage() {
  let overview: OverviewPageData | null = null
  try {
    overview = await fetchOverview()
  } catch (err) {
    console.log(err)
    // non-fatal — OverviewContent renders an empty state when null
  }

  const session = await auth()
  let initialSummary: DashboardSummaryResponse | null = null
  let initialError: string | null = null
  let coachingMoments: CoachingMoment[] = []

  if (session?.user?.pythia2Token) {
    const token = session.user.pythia2Token

    try {
      initialSummary = await fetchDashboardSummary({ token, weekOffset: 1 })
    } catch (err) {
      unstable_rethrow(err) // let a session-expiry redirect from the client propagate
      initialError = extractApiErrorMessage(err, 'Unable to load your dashboard. Please try again.')
    }

    try {
      coachingMoments = await fetchCoachingMoments(token)
    } catch (err) {
      unstable_rethrow(err) // let a session-expiry redirect from the client propagate
      console.log(err)
      // non-fatal — CoachingMoments renders an empty list when empty
    }
  }

  return (
    <OverviewContent overview={overview} initialSummary={initialSummary} initialError={initialError} coachingMoments={coachingMoments} />
  )
}
