import { unstable_rethrow } from 'next/navigation'
import LeaderboardContent from '@/components/LeaderboardContent/LeaderboardContent'
import { fetchDashboardSummary } from '@/queries/scorecard'
import { auth } from '@/auth'
import type { DashboardSummaryResponse } from '@/types/overview'
import { extractApiErrorMessage } from '@/utils/common'

export default async function LeaderboardPage() {
  const session = await auth()
  let initialSummary: DashboardSummaryResponse | null = null
  let initialError: string | null = null

  if (session?.user?.pythia2Token) {
    try {
      initialSummary = await fetchDashboardSummary({ token: session.user.pythia2Token, weekOffset: 1 })
    } catch (err) {
      unstable_rethrow(err) // let a session-expiry redirect from the client propagate
      initialError = extractApiErrorMessage(err, 'Unable to load the leaderboard. Please try again.')
    }
  }

  return <LeaderboardContent initialSummary={initialSummary} initialError={initialError} />
}
