import Header from '@/components/shared/Header/Header'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import {
  PREVIEW_HERO_BANNER_DATA,
  PREVIEW_WEEKLY_STATS,
  PREVIEW_COACHING_MOMENTS,
  PREVIEW_PROGRESS_DATA,
  PREVIEW_TEAM_RANKING,
} from '@/lib/kpi-preview-data'

export const metadata = {
  title: 'Pythia — Employee Overview (Super Admin)',
  description: 'Super Admin static preview of the Employee Overview page.',
}

// Static preview of /dashboard/overview for the Super Admin panel — renders
// the real employee-facing components with sample data (previewMode), the
// same convention used by KpiVisibilityPanel's hover previews. Not wired to
// live per-employee data yet.
export default function SuperAdminEmployeeOverviewPage() {
  return (
    <>
      <Header title="My Dashboard" subtitle="Super Admin · Sample data preview" />

      <div className="grid px-[30px] py-[24px] gap-5">
        <HeroBanner data={PREVIEW_HERO_BANNER_DATA} weeklyStats={PREVIEW_WEEKLY_STATS} />

        <div className="grid grid-cols-2 items-start gap-[18px]">
          <CoachingMoments items={PREVIEW_COACHING_MOMENTS} previewMode />
          <Leaderboard data={PREVIEW_TEAM_RANKING} previewMode />
        </div>

        <ProgressChart data={PREVIEW_PROGRESS_DATA} previewMode />

        <SwagStore previewMode />
      </div>
    </>
  )
}
