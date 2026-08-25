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
    const [summaryResult] = await Promise.allSettled([
      fetchDashboardSummary({ token: session.user.pythia2Token, weekOffset: 1 })
    ])
    if (summaryResult.status === 'rejected') {
      unstable_rethrow(summaryResult.reason)
      initialError = extractApiErrorMessage(summaryResult.reason, 'Unable to load the leaderboard. Please try again.')
    } else {
      initialSummary = summaryResult.value
    }
  }

  return <LeaderboardContent initialSummary={initialSummary} initialError={initialError} />
}
