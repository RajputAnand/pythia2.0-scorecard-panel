import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import ManagerDashboardKpiStrip from '@/components/ManagerDashboardKpiStrip/ManagerDashboardKpiStrip'
import EmployeeSpotlightCard from '@/components/EmployeeSpotlightCard/EmployeeSpotlightCard'
import ManagerDashboardLeaderboard from '@/components/ManagerDashboardLeaderboard/ManagerDashboardLeaderboard'
import ManagerDashboardTrendChart from '@/components/ManagerDashboardTrendChart/ManagerDashboardTrendChart'
import UnknownIdentitiesAlertCard from '@/components/UnknownIdentitiesAlertCard/UnknownIdentitiesAlertCard'
import CoachingHealthSnapshot from '@/components/CoachingHealthSnapshot/CoachingHealthSnapshot'
import DemographicShifts from '@/components/DemographicShifts/DemographicShifts'
import CustomerSegmentShifts from '@/components/CustomerSegmentShifts/CustomerSegmentShifts'
import { fetchManagerDashboardSummary, fetchManagerDashboardLeaderboard, fetchManagerDashboardTrend } from '@/queries/manager-dashboard'
import { fetchUnknownIdentitiesCount } from '@/queries/unknown-identities'
import { fetchCoachingSummary } from '@/queries/manager-coaching'
import { fetchAgeDistribution, fetchGenderDistribution, fetchCustomerSegments } from '@/queries/demographics'
import { auth } from '@/auth'
import type { ManagerDashboardEmployeeRow, ManagerDashboardSummary, ManagerDashboardTrendWeek } from '@/types/manager-dashboard'
import type { CoachingSummary } from '@/types/coaching-plan'
import type { AgeDistributionResponse, GenderDistributionResponse, CustomerSegmentsResponse } from '@/types/demographics'

export const metadata = {
  title: 'Pythia — Manager Dashboard (Super Admin)',
  description: 'Super Admin read-only mirror of the Manager Dashboard.',
}

// Read-only mirror of /manager/dashboard for the Super Admin panel — same
// queries/components as the manager page, called with the super admin's own
// session token so the admin can see the same real data managers see.
export default async function SuperAdminManagerDashboardPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let summary: ManagerDashboardSummary | null = null
  let employees: ManagerDashboardEmployeeRow[] = []
  let trendWeeks: ManagerDashboardTrendWeek[] | null = null
  let unknownIdentitiesCount: number | null = null
  let coachingSummary: CoachingSummary | null = null
  let ageData: AgeDistributionResponse | null = null
  let genderData: GenderDistributionResponse | null = null
  let customerSegmentsData: CustomerSegmentsResponse | null = null

  if (token) {
    const [summaryResult, employeesResult, trendResult, unknownResult, coachingResult, ageResult, genderResult, segmentsResult] = await Promise.allSettled([
      fetchManagerDashboardSummary({ token, view: 'all' }),
      fetchManagerDashboardLeaderboard({ token, view: 'all', sortBy: 'thanked_count' }),
      fetchManagerDashboardTrend({ token, weeks: 8 }),
      fetchUnknownIdentitiesCount({ token }),
      fetchCoachingSummary({ token, view: 'month' }),
      fetchAgeDistribution({ token, storeId: 'STORE-001' }),
      fetchGenderDistribution({ token, storeId: 'STORE-001' }),
      fetchCustomerSegments({ token, storeId: 'STORE-001' }),
    ])
    // Promise.allSettled swallows thrown errors as 'rejected' results, including
    // the NEXT_REDIRECT next/navigation throws server-side on a 401 (session
    // expiry) — rethrow it so the redirect actually happens instead of silently
    // rendering an empty page. See api-client.ts's response interceptor.
    for (const result of [summaryResult, employeesResult, trendResult, unknownResult, coachingResult, ageResult, genderResult, segmentsResult]) {
      if (result.status === 'rejected') unstable_rethrow(result.reason)
    }
    if (summaryResult.status === 'fulfilled') summary = summaryResult.value
    if (employeesResult.status === 'fulfilled') employees = employeesResult.value
    if (trendResult.status === 'fulfilled') trendWeeks = trendResult.value
    if (unknownResult.status === 'fulfilled') unknownIdentitiesCount = unknownResult.value
    if (coachingResult.status === 'fulfilled') coachingSummary = coachingResult.value
    if (ageResult.status === 'fulfilled') ageData = ageResult.value
    if (genderResult.status === 'fulfilled') genderData = genderResult.value
    if (segmentsResult.status === 'fulfilled') customerSegmentsData = segmentsResult.value
  }

  return (
    <>
      <Header title="Manager Dashboard" subtitle="Super Admin" />

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        <UnknownIdentitiesAlertCard count={unknownIdentitiesCount} />
        <EmployeeSpotlightCard topEmployee={employees[0] ?? null} view="all" />
        <ManagerDashboardKpiStrip summary={summary} />
        <ManagerDashboardLeaderboard initialEmployees={employees} initialView="all" />
        <div className="grid grid-cols-[1fr_1fr] gap-[18px] items-start">
          <DemographicShifts ageData={ageData} genderData={genderData} />
          <CustomerSegmentShifts customerSegmentsData={customerSegmentsData} />
        </div>
        <div className="grid grid-cols-2 gap-5 items-start">
          <CoachingHealthSnapshot summary={coachingSummary} />
          <ManagerDashboardTrendChart weeks={trendWeeks} />
        </div>
      </div>
    </>
  )
}
