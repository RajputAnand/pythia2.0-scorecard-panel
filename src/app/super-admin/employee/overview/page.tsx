import { unstable_rethrow } from 'next/navigation'
import { auth } from '@/auth'
import SuperAdminEmployeeOverviewContent from '@/components/SuperAdminEmployeeOverviewContent/SuperAdminEmployeeOverviewContent'
import { fetchEmployees } from '@/queries/employees'
import { fetchOverview } from '@/queries/overview'
import { fetchCoachingMoments, fetchDashboardSummary, fetchShiftHighlights } from '@/queries/scorecard'
import type { ApiEmployee } from '@/types/employee'
import type { CoachingMoment, DashboardSummaryResponse, OverviewPageData } from '@/types/overview'
import type { ShiftHighlight } from '@/types/shift'

export const metadata = {
  title: 'Pythia — Employee Overview (Super Admin)',
  description: 'Super Admin live performance overview and scorecard of selected employees.',
}

export default async function SuperAdminEmployeeOverviewPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token ?? ''

  let overview: OverviewPageData | null = null
  const [overviewResult] = await Promise.allSettled([fetchOverview()])
  if (overviewResult.status === 'fulfilled') {
    overview = overviewResult.value
  }

  let initialEmployees: ApiEmployee[] = []
  let initialSelectedEmployee: ApiEmployee | null = null
  let initialSummary: DashboardSummaryResponse | null = null
  let initialCoachingMoments: CoachingMoment[] = []
  let initialCoachingGenerationInProgress = false
  let initialShiftHighlights: ShiftHighlight[] = []
  let initialShiftHighlightsGenerating = false

  if (token) {
    const [employeesResult] = await Promise.allSettled([
      fetchEmployees({ token, skip: 0, limit: 100 }),
    ])
    if (employeesResult.status === 'rejected') {
      unstable_rethrow(employeesResult.reason)
    }
    if (employeesResult.status === 'fulfilled') {
      initialEmployees = employeesResult.value.data ?? []
      initialSelectedEmployee = initialEmployees[0] ?? null
    }

    if (initialSelectedEmployee) {
      const empId = initialSelectedEmployee.user_id || initialSelectedEmployee._id
      const [summaryResult, coachingResult] = await Promise.allSettled([
        fetchDashboardSummary({ token, weekOffset: 0, employeeId: empId }),
        fetchCoachingMoments(token, empId),
      ])

      if (summaryResult.status === 'rejected') {
        unstable_rethrow(summaryResult.reason)
      } else {
        initialSummary = summaryResult.value
      }

      if (coachingResult.status === 'rejected') {
        unstable_rethrow(coachingResult.reason)
      } else {
        initialCoachingMoments = coachingResult.value.items
        initialCoachingGenerationInProgress = coachingResult.value.generationInProgress
      }

      const shiftStart = initialSummary?.today?.shift_start
      const shiftStatus = initialSummary?.today?.data?.shift_status
      if (shiftStart && shiftStatus && shiftStatus !== 'no_data') {
        try {
          const highlightsResult = await fetchShiftHighlights({
            token,
            shiftStart,
            shiftStatus,
            employeeId: empId,
          })
          initialShiftHighlights = highlightsResult.items
          initialShiftHighlightsGenerating = highlightsResult.generationInProgress
        } catch (err) {
          unstable_rethrow(err)
        }
      }
    }
  }

  return (
    <SuperAdminEmployeeOverviewContent
      initialEmployees={initialEmployees}
      initialSelectedEmployee={initialSelectedEmployee}
      initialSummary={initialSummary}
      initialCoachingMoments={initialCoachingMoments}
      initialCoachingGenerationInProgress={initialCoachingGenerationInProgress}
      initialShiftHighlights={initialShiftHighlights}
      initialShiftHighlightsGenerating={initialShiftHighlightsGenerating}
      overview={overview}
      token={token}
    />
  )
}

