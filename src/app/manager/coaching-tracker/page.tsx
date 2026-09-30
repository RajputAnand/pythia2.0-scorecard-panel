import { unstable_rethrow } from 'next/navigation'
import { cookies } from 'next/headers'
import Header from '@/components/shared/Header/Header'
import CoachingWinStrip from '@/components/CoachingWinStrip/CoachingWinStrip'
import CoachingTrackerPanel from '@/components/CoachingTrackerPanel/CoachingTrackerPanel'
import CoachingTrackerContent from '@/components/CoachingTrackerContent/CoachingTrackerContent'
import { fetchCoachingSummary, fetchCoachingEmployees } from '@/queries/manager-coaching'
import { fetchStoresForTenant } from '@/queries/stores'
import { auth } from '@/auth'
import type { CoachingSummary, CoachingEmployeeChip } from '@/types/coaching-plan'

export const metadata = {
  title: 'Pythia — Coaching Effectiveness Tracker',
  description: 'Track coaching effectiveness, issue resolution rates, and employee progress.',
}

export default async function CoachingTrackerPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  const cookieStore = await cookies()
  let selectedStoreId = cookieStore.get('pythia_selected_store_id')?.value

  if (!selectedStoreId && token) {
    try {
      const storesRes = await fetchStoresForTenant({ token, limit: 1 })
      selectedStoreId = storesRes.data?.[0]?.storeNo || storesRes.data?.[0]?.id || storesRes.data?.[0]?._id
    } catch {
      // fallback
    }
  }

  let summary: CoachingSummary | null = null
  let employees: CoachingEmployeeChip[] = []

  if (token) {
    const [summaryResult, employeesResult] = await Promise.allSettled([
      fetchCoachingSummary({ token, view: 'month', storeId: selectedStoreId }),
      fetchCoachingEmployees({ token, storeId: selectedStoreId, view: 'month' }),
    ])
    // Promise.allSettled swallows thrown errors as 'rejected' results, including
    // the NEXT_REDIRECT next/navigation throws server-side on a 401 (session
    // expiry) — rethrow it so the redirect actually happens instead of silently
    // rendering an empty page. See api-client.ts's response interceptor.
    if (summaryResult.status === 'rejected') unstable_rethrow(summaryResult.reason)
    if (employeesResult.status === 'rejected') unstable_rethrow(employeesResult.reason)
    if (summaryResult.status === 'fulfilled') summary = summaryResult.value
    if (employeesResult.status === 'fulfilled') employees = employeesResult.value
  }

  return (
    <CoachingTrackerContent
      initialSummary={summary}
      initialEmployees={employees}
      selectedStoreId={selectedStoreId}
    />
  )
}
