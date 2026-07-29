import Header from '@/components/shared/Header/Header'
import ManagerDashboardKpiStrip from '@/components/ManagerDashboardKpiStrip/ManagerDashboardKpiStrip'
import EmployeeSpotlightCard from '@/components/EmployeeSpotlightCard/EmployeeSpotlightCard'
import ManagerDashboardLeaderboard from '@/components/ManagerDashboardLeaderboard/ManagerDashboardLeaderboard'
import ManagerDashboardTrendChart from '@/components/ManagerDashboardTrendChart/ManagerDashboardTrendChart'
import UnknownIdentitiesAlertCard from '@/components/UnknownIdentitiesAlertCard/UnknownIdentitiesAlertCard'
import CoachingHealthSnapshot from '@/components/CoachingHealthSnapshot/CoachingHealthSnapshot'
import { fetchManagerDashboardSummary, fetchManagerDashboardLeaderboard, fetchManagerDashboardTrend } from '@/queries/manager-dashboard'
import { fetchUnknownIdentitiesCount } from '@/queries/unknown-identities'
import { fetchCoachingSummary } from '@/queries/manager-coaching'
import { auth } from '@/auth'
import { getWeekSubtitle } from '@/utils/common'
import type { ManagerDashboardEmployeeRow, ManagerDashboardSummary, ManagerDashboardTrendWeek } from '@/types/manager-dashboard'
import type { CoachingSummary } from '@/types/coaching-plan'

export const metadata = {
  title: 'Pythia — Manager Dashboard',
  description: 'Employee recognition insights: thank-yous, value proposition, and greeted-on-time rates.',
}

const currentDate = new Date(2026, 5, 14)

export default async function ManagerDashboardPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let summary: ManagerDashboardSummary | null = null
  let employees: ManagerDashboardEmployeeRow[] = []
  let trendWeeks: ManagerDashboardTrendWeek[] | null = null
  let unknownIdentitiesCount: number | null = null
  let coachingSummary: CoachingSummary | null = null

  if (token) {
    const [summaryResult, employeesResult, trendResult, unknownResult, coachingResult] = await Promise.allSettled([
      fetchManagerDashboardSummary({ token, view: 'all' }),
      fetchManagerDashboardLeaderboard({ token, view: 'all', sortBy: 'thanked_count' }),
      fetchManagerDashboardTrend({ token, weeks: 8 }),
      fetchUnknownIdentitiesCount({ token }),
      fetchCoachingSummary({ token, view: 'week' }),
    ])
    if (summaryResult.status === 'fulfilled') summary = summaryResult.value
    if (employeesResult.status === 'fulfilled') employees = employeesResult.value
    if (trendResult.status === 'fulfilled') trendWeeks = trendResult.value
    if (unknownResult.status === 'fulfilled') unknownIdentitiesCount = unknownResult.value
    if (coachingResult.status === 'fulfilled') coachingSummary = coachingResult.value
  }

  return (
    <>
      <Header title="Manager Dashboard" subtitle={getWeekSubtitle(currentDate)} />

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        <UnknownIdentitiesAlertCard count={unknownIdentitiesCount} />
        <EmployeeSpotlightCard topEmployee={employees[0] ?? null} view="all" />
        <ManagerDashboardKpiStrip summary={summary} />
        <ManagerDashboardLeaderboard initialEmployees={employees} initialView="all" />
        <div className="grid grid-cols-2 gap-5 items-start">
          <CoachingHealthSnapshot summary={coachingSummary} />
          <ManagerDashboardTrendChart weeks={trendWeeks} />
        </div>
      </div>
    </>
  )
}
