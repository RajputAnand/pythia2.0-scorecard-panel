import ProgressContent from '@/components/ProgressContent/ProgressContent'
import { fetchDashboardSummary } from '@/queries/scorecard'
import { auth } from '@/auth'
import type { DashboardSummaryResponse } from '@/types/overview'
import { extractApiErrorMessage } from '@/utils/common'

export default async function ProgressPage() {
  const session = await auth()
  let initialSummary: DashboardSummaryResponse | null = null
  let initialError: string | null = null

  if (session?.user?.pythia2Token) {
    try {
      initialSummary = await fetchDashboardSummary({ token: session.user.pythia2Token, weekOffset: 1 })
    } catch (err) {
      initialError = extractApiErrorMessage(err, 'Unable to load your progress. Please try again.')
    }
  }

  return <ProgressContent initialSummary={initialSummary} initialError={initialError} />
}
