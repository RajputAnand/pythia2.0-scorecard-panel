import { unstable_rethrow } from 'next/navigation'
import { auth } from '@/auth'
import Header from '@/components/shared/Header/Header'
import StaffingHeaderActions from '@/components/StaffingHeaderActions/StaffingHeaderActions'
import StaffingInsightStrip from '@/components/StaffingInsightStrip/StaffingInsightStrip'
import StaffingPageContent from '@/components/StaffingPageContent/StaffingPageContent'
import { STORES } from '@/lib/store-data'
import {
  fetchStaffingSchedule,
  fetchStaffingRoster,
  fetchStaffingHeatmap,
  fetchStaffingInsights,
  fetchStaffingRecommendations,
} from '@/queries/staffing'
import type {
  ApiScheduleResponse,
  ApiRosterMember,
  ApiTrafficHeatmap,
  ApiInsights,
  ApiRecommendationsResponse,
} from '@/types/staff'

export const metadata = {
  title: 'Pythia — Staffing Intelligence (Super Admin)',
  description: 'Super Admin read-only mirror of the Staffing Intelligence page.',
}

/** Monday (YYYY-MM-DD) of the store-local week containing `date`. */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function mondayOf(date: Date): string {
  const day = date.getDay() // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)
  return formatLocalDate(monday)
}

// Read-only mirror of /manager/staffing-intelligence for the Super Admin panel —
// same queries, same components, fetched with the super admin's own token.
export default async function SuperAdminStaffingIntelligencePage() {
  const session = await auth()
  const token = session?.user?.pythia2Token
  const storeId = STORES[0]?._id ?? ''
  const weekStartDate = mondayOf(new Date())

  let schedule: ApiScheduleResponse | null = null
  let roster: ApiRosterMember[] = []
  let heatmap: ApiTrafficHeatmap | null = null
  let insights: ApiInsights | null = null
  let recommendations: ApiRecommendationsResponse | null = null

  if (token && storeId) {
    const results = await Promise.allSettled([
      fetchStaffingSchedule({ token, storeId, weekStartDate }),
      fetchStaffingRoster({ token, storeId }),
      fetchStaffingHeatmap({ token, storeId, weekStartDate }),
      fetchStaffingInsights({ token, storeId, weekStartDate }),
      fetchStaffingRecommendations({ token, storeId, weekStartDate }),
    ])
    for (const result of results) {
      if (result.status === 'rejected') unstable_rethrow(result.reason)
    }
    const [scheduleResult, rosterResult, heatmapResult, insightsResult, recommendationsResult] = results
    if (scheduleResult.status === 'fulfilled') schedule = scheduleResult.value
    if (rosterResult.status === 'fulfilled') roster = rosterResult.value
    if (heatmapResult.status === 'fulfilled') heatmap = heatmapResult.value
    if (insightsResult.status === 'fulfilled') insights = insightsResult.value
    if (recommendationsResult.status === 'fulfilled') recommendations = recommendationsResult.value
  }

  return (
    <>
      <Header title="Staffing Intelligence" subtitle="Super Admin">
        <StaffingHeaderActions />
      </Header>

      <div className="px-[30px] py-6 flex flex-col gap-[18px]">
        {/* No previewMode passed — a KPI toggled off by Super Admin stays hidden here too. */}
        <StaffingInsightStrip data={insights} />
        <StaffingPageContent
          storeId={storeId}
          initialWeekStartDate={weekStartDate}
          initialSchedule={schedule}
          initialRoster={roster}
          initialHeatmap={heatmap}
          initialInsights={insights}
          initialRecommendations={recommendations}
        />
      </div>
    </>
  )
}
