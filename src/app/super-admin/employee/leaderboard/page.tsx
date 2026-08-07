import Header from '@/components/shared/Header/Header'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import { PREVIEW_TEAM_RANKING } from '@/lib/kpi-preview-data'

export const metadata = {
  title: 'Pythia — Employee Leaderboard (Super Admin)',
  description: 'Super Admin static preview of the Employee Leaderboard page.',
}

// Static preview of /dashboard/leaderboard for the Super Admin panel — see
// src/app/super-admin/employee/overview/page.tsx for the pattern.
export default function SuperAdminEmployeeLeaderboardPage() {
  return (
    <>
      <Header title="My Dashboard" subtitle="Super Admin · Sample data preview" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <Leaderboard data={PREVIEW_TEAM_RANKING} previewMode />
      </div>
    </>
  )
}
