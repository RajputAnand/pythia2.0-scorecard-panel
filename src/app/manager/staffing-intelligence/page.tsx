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
  title: 'Pythia — Staffing Intelligence',
  description: 'AI-powered staffing schedule with coverage gap detection, fatigue flags, and smart recommendations.',
}

/** "YYYY-MM-DD" from a Date's LOCAL calendar components — never via .toISOString(),
 * which converts to UTC and silently rolls the date back a day for any server
 * process running in a timezone ahead of UTC (e.g. IST) during the early-morning
 * hours where local and UTC calendar dates differ. See addDaysToDateString in
 * staffing-transform.ts for the same bug, first found or fixed there. */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday (YYYY-MM-DD) of the store-local week containing `date`. */
function mondayOf(date: Date): string {
  const day = date.getDay() // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)
  return formatLocalDate(monday)
}

export default async function StaffingIntelligencePage() {
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
    // Promise.allSettled swallows thrown errors as 'rejected' results, including the
    // NEXT_REDIRECT next/navigation throws server-side on a 401 (session expiry) —
    // rethrow it so the redirect actually happens instead of silently rendering an
    // empty page. See api-client.ts's response interceptor.
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
      <Header title="Staffing Intelligence">
        <StaffingHeaderActions />
      </Header>

      <div className="px-[30px] py-6 flex flex-col gap-[18px]">
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
