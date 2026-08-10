import { unstable_rethrow } from 'next/navigation'
import Header from '@/components/shared/Header/Header'
import headerStyles from '@/components/shared/Header/Header.module.css'
import CoachingWinStrip from '@/components/CoachingWinStrip/CoachingWinStrip'
import CoachingTrackerPanel from '@/components/CoachingTrackerPanel/CoachingTrackerPanel'
import { fetchCoachingSummary, fetchCoachingEmployees } from '@/queries/manager-coaching'
import { auth } from '@/auth'
import type { CoachingSummary, CoachingEmployeeChip } from '@/types/coaching-plan'

export const metadata = {
  title: 'Pythia — Coaching Effectiveness Tracker',
  description: 'Track coaching effectiveness, issue resolution rates, and employee progress.',
}

export default async function CoachingTrackerPage() {
  const session = await auth()
  const token = session?.user?.pythia2Token

  let summary: CoachingSummary | null = null
  let employees: CoachingEmployeeChip[] = []

  if (token) {
    const [summaryResult, employeesResult] = await Promise.allSettled([
      fetchCoachingSummary({ token, view: 'month' }),
      fetchCoachingEmployees({ token }),
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
    <>
      <Header title="Coaching Effectiveness Tracker">
        <button className={headerStyles.btnGhost}>Export</button>
        <button className={headerStyles.btnPrimary}>All Time View</button>
      </Header>

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        <CoachingWinStrip summary={summary} />
        <CoachingTrackerPanel initialEmployees={employees} />
      </div>
    </>
  )
}
